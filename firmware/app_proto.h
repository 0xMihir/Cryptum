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

    APP_CMD_SIGN_DATA       = 0x05,
    APP_RSP_SIGN_DATA       = 0x06, 

	APP_RSP_UNKNOWN_CMD     = 0xff,
};
// clang-format on

void appreply(struct frame_header hdr, enum appcmd rspcode, void *buf);

#endif
