# 8.0.2 APK ↔ private-server compatibility analysis

## Confirmed request path
The 8.0.2 native client contains these handshake endpoints:
- /versionCombo.ds
- /notice/notices.ds
- /check/serverTime.ds
- /check/configCheck.ds
- /check/clientLog.ds

The original server implemented POST handlers for the same four core endpoints, but only 19 of the 90 `.ds` endpoints exposed by the 8.0.2 binary. Older clients may use root aliases such as `/serverTime.ds`, `/configCheck.ds`, and `/notices.ds`, so compatibility aliases were added.

## URL verification
The 8.0.2 native library no longer contains the original Cookierun game-server hosts after patching; game-server hosts were normalized to `https://an-b343.onrender.com/` and the agreement endpoint to `https://an-b343.onrender.com/download/default/agreement.json`. Kakao API base URLs in `Config.smali` point to `https://an-b343.onrender.com` and `/v1`.

## Version response
The server now returns a structurally complete legacy `version.json` using 8.02 rather than zero/empty numeric fields. This avoids making an old parser handle special zero values while not advertising an upgrade above the 8.02 client.

## Packet compatibility
Server encrypted packets are explicitly returned as `application/json`.

## Important limitation
The APK has not been rebuilt/signed in this environment, so this directory is the patched decompile. The server patch is intended to make the old 8.0.2 handshake tolerant of the protocol variants actually exposed by the APK.
