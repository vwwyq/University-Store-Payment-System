# University-Store-Payment-System
Prepaid Wallet System +  Volunteer-Based Ride-Sharing System, for University.

## Wallet Feature Testing Commands

This guide provides the necessary `curl` commands to test the wallet functionalities. Make sure your backend server is running on the correct port (default is 5000) before executing these commands.

### Topup

```bash
curl -X POST http://localhost:5000/wallet/topup \
     -H "Content-Type: application/json" \
     -d '{"userId": "user123", "amount": 500}'
```

### Check Balance

```bash
curl -X GET "http://localhost:5000/wallet/balance?userId=user123"
```

### Pay 

```bash
curl -X POST http://localhost:5000/wallet/pay \
     -H "Content-Type: application/json" \
     -d '{"userId": "user123", "amount": 200}'
```
### Check Transaction History

```bash
curl -X GET "http://localhost:5000/wallet/history?userId=user123"
```
