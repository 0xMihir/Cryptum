#include "app_proto.h"

void appreply(struct frame_header hdr, enum appcmd rspcode, void *buf)
{
	size_t nbytes;
	enum cmdlen len;
	switch (rspcode)
	{
	case APP_RSP_GET_PUBKEY:
		len = LEN_128;
		break;

	case APP_RSP_GET_NAMEVERSION:
		len = LEN_32;
		break;

	case APP_RSP_UNKNOWN_CMD:
		len = LEN_1;
		break;

	case APP_RSP_SIGN_DATA:
		len = LEN_4;
		break;

	default:
		return;
	}

	nbytes = cmdlen_to_bytes(len);

	writebyte(genhdr(hdr.id, hdr.endpoint, 0x0, len));

	writebyte(rspcode);
	nbytes--;

	write(buf, nbytes);
}
