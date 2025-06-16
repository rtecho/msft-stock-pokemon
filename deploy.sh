#!/bin/bash

# ----------------------
# Custom deployment script for Azure App Service
# ----------------------

# 1. Install npm packages
if [ -e "./package.json" ]; then
  echo "Installing npm packages"
  npm install --production
  # Check if installation was successful
  if [ $? -ne 0 ]; then
    echo "npm install failed, retrying with more debug info"
    npm install --production --verbose
    # If it still fails, exit with error
    if [ $? -ne 0 ]; then
      echo "npm install failed after retry"
      exit 1
    fi
  fi
  echo "npm packages installed successfully"
  # List installed packages for verification
  echo "Installed packages:"
  npm list --depth=0
fi

# 2. Create the web.config file if not exists
if [ ! -e "./web.config" ]; then
  echo "Creating web.config file"
  cat > ./web.config << EOF
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode" />
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^server.js\/debug[\/]?" />
        </rule>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}" />
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True" />
          </conditions>
          <action type="Rewrite" url="server.js" />
        </rule>
      </rules>
    </rewrite>
    <defaultDocument enabled="true">
      <files>
        <add value="server.js" />
      </files>
    </defaultDocument>
    <directoryBrowse enabled="false" />
    <iisnode
      nodeProcessCommandLine="node"
      loggingEnabled="true"
      logDirectory="iisnode"
      watchedFiles="*.js;iisnode.yml"
      debuggingEnabled="true" />
  </system.webServer>
</configuration>
EOF
fi

# 3. Copy required files if not exists
# Skip copying server.js since we have a custom one in the root
# if [ ! -e "./server.js" ]; then
#   echo "Creating server.js file"
#   cp ./src/server.js ./server.js
# fi
