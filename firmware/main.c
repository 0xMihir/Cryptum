// Adapted from TKey Signer App

#include <tk1_mem.h>
#include <types.h>

#include "app_proto.h"
#include "monocypher/monocypher-ed25519.h"
#include "monocypher/monocypher.h"

// clang-format off
static volatile uint32_t *cdi = (volatile uint32_t *)TK1_MMIO_TK1_CDI_FIRST;
static volatile uint32_t *led = (volatile uint32_t *)TK1_MMIO_TK1_LED;
static volatile uint32_t *touch = (volatile uint32_t *)TK1_MMIO_TOUCH_STATUS;
static volatile uint32_t *trng_status = (volatile uint32_t *)TK1_MMIO_TRNG_STATUS;
static volatile uint32_t *trng_entropy =(volatile uint32_t *)TK1_MMIO_TRNG_ENTROPY;
static volatile uint32_t *can_rx = (volatile uint32_t *)TK1_MMIO_UART_RX_STATUS;
static volatile uint32_t *rx = (volatile uint32_t *)TK1_MMIO_UART_RX_DATA;
static volatile uint32_t *can_tx = (volatile uint32_t *)TK1_MMIO_UART_TX_STATUS;
static volatile uint32_t *tx = (volatile uint32_t *)TK1_MMIO_UART_TX_DATA;

#define LED_BLACK 0
#define LED_RED (1 << TK1_MMIO_TK1_LED_R_BIT)
#define LED_GREEN (1 << TK1_MMIO_TK1_LED_G_BIT)
#define LED_BLUE (1 << TK1_MMIO_TK1_LED_B_BIT)
// clang-format on

const uint8_t app_name0[4] = "cryp";
const uint8_t app_name1[4] = "tum ";
const uint32_t app_version = 0x00000001;

#define MAX_SIGN_SIZE 4096

void wait_touch_ledflash(int ledvalue, int loopcount)
{
	int led_on = 0;
	// first a write, to ensure no stray touch?
	*touch = 0;
	for (;;)
	{
		*led = led_on ? ledvalue : 0;
		for (int i = 0; i < loopcount; i++)
		{
			if (*touch & (1 << TK1_MMIO_TOUCH_STATUS_EVENT_BIT))
			{
				goto touched;
			}
		}
		led_on = !led_on;
	}
touched:
	// write, confirming we read the touch event
	*touch = 0;
}

int main(void)
{
	uint32_t stack;
	uint8_t pubkey[32];
	struct frame_header hdr; // Used in both directions
	uint8_t cmd[CMDLEN_MAXBYTES];
	uint8_t rsp[CMDLEN_MAXBYTES];
	uint8_t sign_message[MAX_SIGN_SIZE];
	uint32_t message_size = 0;
	int msg_idx; // Where we are currently loading the data to sign
	uint8_t signature[64];
	uint8_t signature_done = 0;
	int left = 0;	// Bytes left to read
	int nbytes = 0; // Bytes to write to memory
	uint8_t in;
	uint32_t local_cdi[8];

	wordcpy(local_cdi, (void *)cdi, 8);
	crypto_ed25519_public_key(pubkey, (const uint8_t *)local_cdi);

	int led_steady = LED_BLACK;
	for (;;)
	{
		in = readbyte_ledflash(LED_BLUE, 1000000);
		*led = led_steady;

		if (parseframe(in, &hdr) == -1)
		{ // Invalid frame
			continue;
		}

		memset(cmd, 0, CMDLEN_MAXBYTES);

		read(cmd, hdr.len);

		if (hdr.endpoint != DST_SW)
		{
			continue; // Message meant for another endpoint
		}

		switch (cmd[0])
		{
		case APP_CMD_GET_NAMEVERSION:
			if (hdr.len == 1)
			{
				memcpy(rsp, app_name0, 4);
				memcpy(rsp + 4, app_name1, 4);
				memcpy(rsp + 8, &app_version, 4);
			}
			appreply(hdr, APP_RSP_GET_NAMEVERSION, rsp);
			break;
		case APP_CMD_GET_PUBKEY:
			memcpy(rsp, pubkey, 32);
			appreply(hdr, APP_RSP_GET_PUBKEY, pubkey);
			break;

		case APP_CMD_SET_SIZE:
			if (hdr.len != 32)
			{
				rsp[0] = STATUS_BAD;
				appreply(hdr, APP_RSP_SET_SIZE, rsp);
				break;
			}
			signature_done = 0;

			message_size = cmd[1] + (cmd[2] << 8) + (cmd[3] << 16) +
						   (cmd[4] << 24);

			if (message_size > MAX_SIGN_SIZE)
			{
				rsp[0] = STATUS_BAD;
				appreply(hdr, APP_RSP_SET_SIZE, rsp);
				break;
			}

			left = message_size;
			msg_idx = 0;

			rsp[0] = STATUS_OK;
			appreply(hdr, APP_RSP_SET_SIZE, rsp);
			led_steady = LED_GREEN;
			break;

		case APP_CMD_SIGN_DATA:
		{
			const uint32_t cmdBytelen = 128;

			if (hdr.len != cmdBytelen || message_size == 0)
			{
				rsp[0] = STATUS_BAD;
				appreply(hdr, APP_RSP_SIGN_DATA, rsp);
				break;
			}

			if (left > (cmdBytelen - 1))
			{
				nbytes = cmdBytelen - 1;
			}
			else
			{
				nbytes = left;
			}

			memcpy(&sign_message[msg_idx], cmd + 1, nbytes);
			msg_idx += nbytes;
			left -= nbytes;

			if (left == 0)
			{
				wait_touch_ledflash(LED_GREEN, 350000);

				// All loaded, device touched, let's
				// sign the message
				crypto_ed25519_sign(signature,
									(void *)local_cdi, pubkey,
									sign_message, message_size);
				signature_done = 1;
				message_size = 0;
			}

			rsp[0] = STATUS_OK;
			appreply(hdr, APP_RSP_SIGN_DATA, rsp);
			led_steady = LED_GREEN;
			break;
		}
		case APP_CMD_GET_SIG:
			if (signature_done == 0)
			{
				rsp[0] = STATUS_BAD;
				appreply(hdr, APP_RSP_GET_SIG, rsp);
				break;
			}
			rsp[0] = STATUS_OK;
			memcpy(rsp + 1, signature, 64);
			appreply(hdr, APP_RSP_GET_SIG, rsp);
			led_steady = LED_GREEN;
			break;

		default: // Unknown command
			break;
		}
	}
}