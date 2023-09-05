@echo off
cd ..
cd ..
npx cypress run --spec 'cypress/integration/pampers-de-de/*' --browser chrome

