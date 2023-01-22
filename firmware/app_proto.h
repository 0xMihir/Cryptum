// Copyright (C) 2023 - Mihir Patil

#ifndef APP_PROTO_H
#define APP_PROTO_H

#include <lib.h>
#include <proto.h>

// clang-format off
enum appcmd {
	APP_CMD_GET_NAMEVERSION = 0x01,
	APP_RSP_GET_NAMEVERSION = 0x02,
	
    APP_CMD_GET_PUBKEY      = 0x03,
    APP_RSP_GET_PUBKEY      = 0x04,

    APP_CMD_SET_SIZE        = 0x05,
	APP_RSP_SET_SIZE        = 0x06,

    APP_CMD_SIGN_DATA       = 0x07,
    APP_RSP_SIGN_DATA       = 0x08, 

    APP_CMD_GET_SIG         = 0x09,
	APP_RSP_GET_SIG         = 0x0A,

    APP_CMD_AEAD_ENCRYPT    = 0x0B,
    APP_RSP_AEAD_ENCRYPT    = 0x0C,

    APP_CMD_AEAD_DECRYPT    = 0x0D,
    APP_RSP_AEAD_DECRYPT    = 0x0E,

	APP_RSP_UNKNOWN_CMD     = 0xFF,
};
// clang-format on

void appreply(struct frame_header hdr, enum appcmd rspcode, void *buf);

#endif
