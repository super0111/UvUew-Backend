# Quick Start 🚀

### Add a default.json file in config folder with the following

```
{
  "mongoURI": "<your_mongoDB_Atlas_uri_with_credentials>",
  "jwtSecret": "secret",
  "githubToken": "<yoursecrectaccesstoken>"
}
```

### Install server dependencies

```bash
npm install
```

### Install client dependencies

```bash
npm run server
```

### Run both Express & React from root

```bash
npm run dev
```

### Build for Content

```bash
cd client
npm run build
```

### Test Content before deploy

```

Check in browser on [http://localhost:5000/](http://localhost:5000/)
