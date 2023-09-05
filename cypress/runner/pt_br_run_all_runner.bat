@echo off
cd ..
cd ..
npx cypress run --spec 'cypress/integration/pampers-pt-br/*' --browser chrome

