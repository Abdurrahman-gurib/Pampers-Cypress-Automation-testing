@echo off
cd ..
cd ..
npx cypress run --spec 'cypress/integration/pampers-es-es/*' --browser chrome

