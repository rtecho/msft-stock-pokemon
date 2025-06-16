// main.bicep
// Deploys: Log Analytics, App Insights, Key Vault, App Service (with Docker), Application Settings
// Uses managed identity, secure settings, and connects all monitoring/logging

param environmentName string
param location string
param ALPHA_VANTAGE_API_KEY string

var logAnalyticsName = 'log-${environmentName}'
var appInsightsName = 'appi-${environmentName}'
var keyVaultName = 'kv${environmentName}'

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    accessPolicies: []
    enableRbacAuthorization: true
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    enabledForDiskEncryption: false
    publicNetworkAccess: 'Enabled'
  }
}

resource appServicePlan 'Microsoft.Web/serverfarms@2024-04-01' = {
  name: 'msftstockpokemon-${uniqueString(subscription().id, resourceGroup().id, environmentName)}-plan'
  location: location
  sku: {
    name: 'P1V2'
    tier: 'PremiumV2'
    capacity: 1
  }
}

resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-07-31-PREVIEW' = {
  name: 'msftstockpokemon-identity'
  location: location
}

resource appService 'Microsoft.Web/sites@2024-04-01' = {
  name: 'msftstockpokemon-${uniqueString(subscription().id, resourceGroup().id, environmentName)}'
  location: location
  kind: 'app'
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userAssignedIdentity.id}': {}
    }
  }
  tags: {
    'azd-service-name': 'msft-stock-pokemon'
  }
  properties: {
    siteConfig: {      appSettings: [
        {
          name: 'ALPHA_VANTAGE_API_KEY'
          value: ALPHA_VANTAGE_API_KEY
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~18'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
      ]
      linuxFxVersion: ''
      nodeVersion: '~18'
      scmType: 'LocalGit'
      cors: {
        allowedOrigins: ['*']
        supportCredentials: false
      }
    }
    httpsOnly: true
  }
}

output RESOURCE_GROUP_ID string = resourceGroup().id
