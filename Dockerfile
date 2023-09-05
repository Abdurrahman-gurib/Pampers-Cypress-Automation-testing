FROM cypress/included:4.1.0

WORKDIR /app

COPY . .

RUN npm i cypress
RUN npm i

# healthcheck only
RUN npx cypress info
# RUN npx cypress run --spec 'cypress/integration/pampers-en-us/t2_us_login.spec.js'

# start bash file
# ADD docker-start /
# RUN chmod +x /docker-start
# CMD ["/docker-start"]
