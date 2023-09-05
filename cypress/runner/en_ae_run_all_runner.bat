@echo off
cd ..
cd ..
npx cypress run --spec 'cypress/integration/pampers-en-ae/*' --browser chrome

