# Simple Web Server Startup for macOS
# Require Python
# Access localhost:8800

CURRENT=`dirname "$0"`
cd "$CURRENT"

python -m SimpleHTTPServer 8800
exit
