# BETCOIN
[BETCOIN.com](https://cst-3130-maaz-cw2-final.s3.amazonaws.com/BetCoin-Vite-Tailwind/index.html)
![alt text](<Report/BET-COIN.com Report_page-0001.jpg>)
![alt text](<Report/BET-COIN.com Report_page-0002.jpg>)
![alt text](<Report/BET-COIN.com Report_page-0003.jpg>)
![alt text](<Report/BET-COIN.com Report_page-0004.jpg>)
![alt text](<Report/BET-COIN.com Report_page-0005.jpg>)
![alt text](<Report/BET-COIN.com Report_page-0006.jpg>)
![alt text](<Report/BET-COIN.com Report_page-0007.jpg>)
![alt text](<Report/BET-COIN.com Report_page-0008.jpg>)
![alt text](<Report/BET-COIN.com Report_page-0009.jpg>)
![alt text](<Report/BET-COIN.com Report_page-0010.jpg>)


### Compile and Minify for Production

```sh
cd Code/Frontend/BetCoin-Vite-Tailwind 
npm install
npm run build
cd ../../..
git add 'Code/Frontend/BetCoin-Vite-Tailwind/dist' -f
git commit -m "committing dist version now"  
git subtree push --prefix 'Code/Frontend/BetCoin-Vite-Tailwind/dist' origin gh-pages
```