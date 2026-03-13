FROM ghcr.io/puppeteer/puppeteer:latest

USER root
WORKDIR /app

COPY --chown=pptruser:pptruser package*.json ./
RUN npm install

COPY --chown=pptruser:pptruser . .

RUN chown -R pptruser:pptruser /app

USER pptruser

EXPOSE 3000
CMD ["node", "index.js"]