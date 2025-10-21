# WhatsApp Status Check API

## Overview

The WhatsApp Status Check API provides comprehensive monitoring and diagnostics for the WhatsApp messaging service. It verifies configuration, connectivity, and service availability.

## Endpoint

```
GET /api/webhooks/whatsapp/status
```

## Response Format

### Success Response (200 OK)

```json
{
  "online": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "twilio": {
      "configured": true,
      "connection": "connected",
      "account": {
        "friendlyName": "My Twilio Account",
        "status": "active",
        "type": "Full"
      }
    },
    "environment": {
      "TWILIO_WHATSAPP_NUMBER": "configured",
      "TWILIO_ACCOUNT_SID": "configured",
      "TWILIO_AUTH_TOKEN": "configured",
      "whatsappNumberFormat": "valid"
    },
    "messaging": {
      "service": "available",
      "mockMode": false
    }
  },
  "recommendations": []
}
```

### Service Unavailable Response (503 Service Unavailable)

```json
{
  "online": false,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "twilio": {
      "configured": false,
      "connection": "error",
      "account": null
    },
    "environment": {
      "TWILIO_WHATSAPP_NUMBER": "missing",
      "TWILIO_ACCOUNT_SID": "missing",
      "TWILIO_AUTH_TOKEN": "missing",
      "whatsappNumberFormat": "invalid"
    },
    "messaging": {
      "service": "available",
      "mockMode": true
    }
  },
  "recommendations": [
    "Set TWILIO_WHATSAPP_NUMBER environment variable",
    "Set TWILIO_ACCOUNT_SID environment variable",
    "Set TWILIO_AUTH_TOKEN environment variable",
    "TWILIO_WHATSAPP_NUMBER should start with 'whatsapp:' (e.g., whatsapp:+14155238886)",
    "WhatsApp is running in mock mode - set MOCK_MODE=false for real Twilio integration"
  ]
}
```

### Error Response (500 Internal Server Error)

```json
{
  "online": false,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "error": "Failed to check WhatsApp status",
  "details": "Connection timeout"
}
```

## Status Checks

### 1. Twilio Configuration
- **configured**: Checks if Twilio client is initialized
- **connection**: Tests actual connection to Twilio API
- **account**: Retrieves account information if connected

### 2. Environment Variables
- **TWILIO_WHATSAPP_NUMBER**: Presence and format validation
- **TWILIO_ACCOUNT_SID**: Presence check
- **TWILIO_AUTH_TOKEN**: Presence check
- **whatsappNumberFormat**: Validates WhatsApp number format

### 3. Messaging Service
- **service**: Always "available" (service is running)
- **mockMode**: Indicates if running in mock mode

## Usage Examples

### cURL Request

```bash
curl -X GET http://localhost:3000/api/webhooks/whatsapp/status
```

### JavaScript Fetch

```javascript
async function checkWhatsAppStatus() {
  try {
    const response = await fetch('http://localhost:3000/api/webhooks/whatsapp/status');
    const status = await response.json();
    
    if (status.online) {
      console.log('✅ WhatsApp service is online');
      console.log('Twilio Account:', status.services.twilio.account.friendlyName);
    } else {
      console.log('❌ WhatsApp service is offline');
      console.log('Recommendations:', status.recommendations);
    }
  } catch (error) {
    console.error('Error checking status:', error);
  }
}
```

### Vue.js Component

```javascript
// In a Vue component
async checkWhatsAppStatus() {
  try {
    const response = await fetch('/api/webhooks/whatsapp/status');
    const status = await response.json();
    
    this.whatsappStatus = status;
    
    if (status.online) {
      this.$toast.success('WhatsApp service is online');
    } else {
      this.$toast.error('WhatsApp service is offline');
      this.showRecommendations(status.recommendations);
    }
  } catch (error) {
    this.$toast.error('Failed to check WhatsApp status');
  }
}
```

## HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | WhatsApp service is online and properly configured |
| 503 | Service Unavailable | WhatsApp service is offline or misconfigured |
| 500 | Internal Server Error | Error occurred while checking status |

## Monitoring Integration

### Health Check Script

```bash
#!/bin/bash
# whatsapp-health-check.sh

API_URL="http://localhost:3000/api/webhooks/whatsapp/status"
RESPONSE=$(curl -s -w "%{http_code}" -o /tmp/whatsapp_status.json "$API_URL")
HTTP_CODE="${RESPONSE: -3}"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ WhatsApp service is healthy"
    exit 0
else
    echo "❌ WhatsApp service is unhealthy (HTTP $HTTP_CODE)"
    cat /tmp/whatsapp_status.json
    exit 1
fi
```

### Docker Health Check

```dockerfile
# In Dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/webhooks/whatsapp/status || exit 1
```

### Kubernetes Liveness Probe

```yaml
# In Kubernetes deployment
livenessProbe:
  httpGet:
    path: /api/webhooks/whatsapp/status
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   ```bash
   # Check if variables are set
   echo $TWILIO_WHATSAPP_NUMBER
   echo $TWILIO_ACCOUNT_SID
   echo $TWILIO_AUTH_TOKEN
   ```

2. **Invalid WhatsApp Number Format**
   ```bash
   # Should start with 'whatsapp:'
   export TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
   ```

3. **Twilio Connection Issues**
   - Verify credentials are correct
   - Check network connectivity
   - Ensure account is active

4. **Mock Mode Active**
   ```bash
   # Set to false for real Twilio integration
   export MOCK_MODE=false
   ```

### Debug Mode

Enable detailed logging by setting:

```bash
export LOG_LEVEL=debug
```

## Integration with Frontend

### Status Indicator Component

```vue
<template>
  <div class="whatsapp-status">
    <div class="status-indicator" :class="statusClass">
      <span class="status-icon">{{ statusIcon }}</span>
      <span class="status-text">{{ statusText }}</span>
    </div>
    <div v-if="!isOnline && recommendations.length" class="recommendations">
      <h4>Recommendations:</h4>
      <ul>
        <li v-for="rec in recommendations" :key="rec">{{ rec }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isOnline: false,
      recommendations: []
    }
  },
  computed: {
    statusClass() {
      return this.isOnline ? 'online' : 'offline'
    },
    statusIcon() {
      return this.isOnline ? '✅' : '❌'
    },
    statusText() {
      return this.isOnline ? 'WhatsApp Online' : 'WhatsApp Offline'
    }
  },
  async mounted() {
    await this.checkStatus()
  },
  methods: {
    async checkStatus() {
      try {
        const response = await fetch('/api/webhooks/whatsapp/status')
        const status = await response.json()
        this.isOnline = status.online
        this.recommendations = status.recommendations || []
      } catch (error) {
        console.error('Failed to check WhatsApp status:', error)
        this.isOnline = false
      }
    }
  }
}
</script>
```

## API Documentation

### Request Headers

No special headers required.

### Response Headers

- `Content-Type: application/json`
- `X-Response-Time: <milliseconds>`

### Rate Limiting

No rate limiting applied to status endpoint.

### Caching

Status endpoint should not be cached as it provides real-time status information.

## Security Considerations

- Status endpoint is read-only and safe for public access
- No sensitive information is exposed in responses
- Account information is limited to non-sensitive fields
- Recommendations are generic and don't expose specific configuration details
