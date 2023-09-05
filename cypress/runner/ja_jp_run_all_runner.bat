@echo off
cd ..
cd ..
npx cypress run --spec 'cypress/integration/pampers-ja-jp/*' --browser chrome

