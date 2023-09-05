@echo off
cd ..
cd ..
npx cypress run --spec 'cypress/integration/pampers-en-ca/*' --browser chrome

