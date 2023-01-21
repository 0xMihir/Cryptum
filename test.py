import serial
import binascii
ser = serial.Serial('/dev/cu.usbmodem2101', 62500, serial.EIGHTBITS, serial.PARITY_NONE, serial.STOPBITS_ONE)

values = bytearray([88, 3])
ser.write(values)
buf = ser.read(128)
# print hex values from bytearray
key = buf[2:32+2]
print(str(binascii.hexlify(key)))
ser.close()