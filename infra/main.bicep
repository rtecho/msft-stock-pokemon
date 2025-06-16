// main.bicep
// Deploys: Container App, Log Analytics, App Insights, Key Vault, Container Registry
// Uses managed identity, secure settings, and connects all monitoring/logging

param environmentName string
param location string
param resourceGroupName string
param ALPHA_VANTAGE_API_KEY string

var containerAppName = 'msftstockpokemon-${environmentName}'
var logAnalyticsName = 'log-${environmentName}'
var appInsightsName = 'appi-${environmentName}'
var keyVaultName = 'kv${environmentName}'
var registryName = 'cr${environmentName}'

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

resource registry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: registryName
  location: location
  sku: {
    name: 'Standard'
  }
  properties: {
    adminUserEnabled: false
    publicNetworkAccess: 'Enabled'
  }
}

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: containerAppName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    environmentId: '/subscriptions/${subscription().subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.App/managedEnvironments/${environmentName}-env'
    configuration: {
      secrets: [
        {
          name: 'ALPHA_VANTAGE_API_KEY'
          value: ALPHA_VANTAGE_API_KEY
        }
      ]
      registries: [
        {
          server: '${registryName}.azurecr.io'
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'msft-stock-pokemon'
          image: '${registryName}.azurecr.io/msft-stock-pokemon:latest'
          env: [
            {
              name: 'ALPHA_VANTAGE_API_KEY'
              secretRef: 'ALPHA_VANTAGE_API_KEY'
            }
          ]
          resources: {
            cpu: 0.5
            memory: '1.0Gi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
    ingress: {
      external: true
      targetPort: 3000
      transport: 'auto'
    }
  }
}
