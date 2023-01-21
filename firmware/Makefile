OBJCOPY ?= llvm-objcopy

CC = clang

INCLUDE=include

# If you want libcommon's qemu_puts() et cetera to output something on our QEMU
# debug port, remove -DNODEBUG below
CFLAGS = -target riscv32-unknown-none-elf -march=rv32iczmmul -mabi=ilp32 -mcmodel=medany \
   -static -std=gnu99 -O2 -ffast-math -fno-common -fno-builtin-printf \
   -fno-builtin-putchar -nostdlib -mno-relax -Wall -flto -I $(INCLUDE) -I . -DNODEBUG

AS = clang
ASFLAGS = -target riscv32-unknown-none-elf -march=rv32iczmmul -mabi=ilp32 -mcmodel=medany -mno-relax

LDFLAGS=-T app.lds -L lib/libcommon/ -lcommon -L lib/libcrt0/ -lcrt0

RM=/bin/rm

.PHONY: all
all: app.bin

# C runtime library
lib/libcrt0/libcrt0.a: lib/libcrt0/crt0.o
	llvm-ar -qc $@ lib/libcrt0/crt0.o

# Common C functions
LIBOBJS=lib/libcommon/lib.o lib/libcommon/proto.o
lib/libcommon/libcommon.a: $(LIBOBJS)
	llvm-ar -qc $@ lib/libcommon/lib.o lib/libcommon/proto.o
$(LIBOBJS): include/types.h include/tk1_mem.h include/lib.h include/proto.h

# Monocypher
MONOOBJS=include/monocypher/monocypher.o include/monocypher/monocypher-ed25519.o
include/monocypher/libmonocypher.a: $(MONOOBJS)
	llvm-ar -qc $@ $(MONOOBJS)
$MONOOBJS: include/monocypher/monocypher-ed25519.h include/monocypher/monocypher.h

LIBS=lib/libcrt0/libcrt0.a lib/libcommon/libcommon.a

# Turn elf into bin for device
%.bin: %.elf
	$(OBJCOPY) --input-target=elf32-littleriscv --output-target=binary $^ $@
	chmod a-x $@

CRYPTUMOBJS=main.o app_proto.o
app.elf: $(LIBS) include/monocypher/libmonocypher.a $(CRYPTUMOBJS) app.lds
	$(CC) $(CFLAGS) $(CRYPTUMOBJS) $(LDFLAGS) -L include/monocypher -lmonocypher -I monocypher -o $@
$(CRYPTUMOBJS): $(INCLUDE)/tk1_mem.h app_proto.h

show-%-hash: %/app.bin
	sha256sum $^ | cut -f 1 -d " "

.PHONY: clean
clean:
	$(RM) -f app.bin app.elf $(CRYPTUMOBJS)
	$(RM) -f $(LIBS) $(LIBOBJS) lib/libcrt0/crt0.o
	$(RM) -f include/monocypher/libmonocypher.a $(MONOOBJS)


FMTFILES=*.[ch]
.PHONY: fmt
fmt:
	# Uses ../.clang-format
	clang-format --dry-run --ferror-limit=0 $(FMTFILES)
	clang-format --verbose -i $(FMTFILES)

.PHONY: update-mem-include
update-mem-include:
	cp -af ../../tillitis-key1/hw/application_fpga/fw/tk1_mem.h include/tk1_mem.h
