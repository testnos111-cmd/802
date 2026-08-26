# 8.02 next-step diagnostic patch

## APK-side change
The 8.02 native library still contained four CDN endpoint strings that were not present in the working 10.01 modification in the same form:
- https://cdn.devscake.com/
- http://cdn.devscake.com/
- https://cdn-devscake.akamaized.net/
- http://cdn-devscake.akamaized.net/

All four were replaced in-place with complete URLs pointing to:
- https://an-b343.onrender.com/
- http://an-b343.onrender.com/

No section offsets were moved. The replacement block is shorter than the original block and the remainder was zero-filled.

## Server-side diagnostic change
Every HTTP request now receives a monotonically increasing ID and is logged twice:
1. request event: method, full URL, path, query, IPs, headers, parsed body
2. response event: status, duration, response headers, byte count, UTF-8 body and Base64 body (up to 256 KiB)

Responses that end abnormally and uncaught exceptions/unhandled rejections are also logged.

The log is written to `logs/http.ndjson` as well as stdout, so Render logs show the complete request sequence and the file can be downloaded from the running filesystem during a session.

## How to use the next test
Start this server, launch the patched 8.02 APK, and capture the sequence after `/download/default/version.json`.
The first request ID after the version response will tell us whether the next step is:
- `/download/...`
- `/index/...`
- `/c/...` or another `.ds`
- an HTTP client exception before any next request

If there is no new request after version.json, the response body in the log is the decisive artifact for the APK-side parser/validation path.
