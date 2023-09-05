@echo off
cd ..
cd ..
npx cypress run --spec 'cypress/integration/pampers-ar-sa/*' --browser chrome

