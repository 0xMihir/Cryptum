#include <tk1_mem.h>

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

const uint8_t app_name0[9] = "cryptum ";
const uint8_t app_name1[11] = "file_crypt";
const uint32_t app_version = 0x00000001;

int main(void)
{
	uint32_t stack;
	uint8_t pubkey[32];
	struct frame_header hdr; // Used in both directions
	uint8_t cmd[CMDLEN_MAXBYTES];
	uint8_t rsp[CMDLEN_MAXBYTES];
	uint32_t message_size = 0;
	int msg_idx; // Where we are currently loading the data to sign
	uint8_t signature[64];
	uint32_t signature_done = 0;
	int left = 0;	// Bytes left to read
	int nbytes = 0; // Bytes to write to memory
	uint8_t in;
	uint32_t local_cdi[8];

	wordcpy(local_cdi, (void *)cdi, 8);
	crypto_ed25519_public_key(pubkey, (const uint8_t *)local_cdi);

	for (;;) {
		in = readbyte_ledflash(LED_BLUE + LED_RED, 1000000);

		if (parseframe(in, &hdr) == -1) { // Invalid frame
			continue;
		}

		memset(cmd, 0, CMDLEN_MAXBYTES);

		read(cmd, hdr.len);

		if (hdr.endpoint != DST_SW) {
			continue; // Message meant for another endpoint
		}

		switch (cmd[0]) {
		case APP_CMD_GET_PUBKEY:
			memcpy(rsp, pubkey, 32);
			appreply(hdr, APP_RSP_GET_PUBKEY, pubkey);
			break;
		default: // Unknown command
			break;
		}
	}
}