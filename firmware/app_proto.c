#include "app_proto.h"



void appreply(struct frame_header hdr, enum appcmd rspcode, void *buf)
{
	size_t nbytes;
	enum cmdlen len;
	switch (rspcode) {
	case APP_RSP_GET_PUBKEY:
		len = LEN_128;
		nbytes = 128;
		break;
	default:
		qemu_puts("appreply(): Unknown response code: ");
		qemu_puthex(rspcode);
		qemu_lf();
		return;
	}

	writebyte(genhdr(hdr.id, hdr.endpoint, 0x0, len));

	writebyte(rspcode);
	nbytes--;

	write(buf, nbytes);
}
