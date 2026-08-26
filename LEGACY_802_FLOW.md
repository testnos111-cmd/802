# 8.02 legacy downloader compatibility

The 8.0.2 native client contains the following resource-bootstrap markers together:
- 8.02_a
- index.json
- {"path":"...","hash":"..."}
- file_list
- download/
- index/
- SHA-1
- CrepeVerifyAllVersion
- client.resetCDN.version

This server now exposes the 8.02_a manifest at multiple legacy URL roots:
- /index/8.02_a/index.json
- /download/8.02_a/index.json
- /index/8.02_a/file_list.json
- /download/8.02_a/file_list.json
- /index/8.02_a/file_list
- /download/8.02_a/file_list

Socket close/request-abort events are also logged so a client-side cancellation can be distinguished from a server exception.
