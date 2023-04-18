const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const path = require("path");

const app = express();

app.use(express.json());

const databasePath = path.join(__dirname, "covid19India.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//API 1 GET
app.get("/states/", async (request, response) => {
  const getQuery = `
        SELECT 
            * 
        FROM
            state;
    `;
  const statesList = await db.all(getQuery);

  const convertSnackCasetoCamelCase = (snackCase) => {
    return {
      stateId: snackCase.state_id,
      stateName: snackCase.state_name,
      population: snackCase.population,
    };
  };

  response.send(
    statesList.map((eachState) => convertSnackCasetoCamelCase(eachState))
  );
});

//API 2 GET
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getQuery = `
        SELECT 
            * 
        FROM
            state
        WHERE 
            state_id = ${stateId};
    `;
  const stateDetails = await db.get(getQuery);

  const convertSnackCasetoCamelCase = (snackCase) => {
    return {
      stateId: snackCase.state_id,
      stateName: snackCase.state_name,
      population: snackCase.population,
    };
  };

  response.send(convertSnackCasetoCamelCase(stateDetails));
});

//API 3 POST
app.post("/districts/", async (request, response) => {
  const requestBody = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = requestBody;
  const postQuery = `
        INSERT INTO 
            district(district_name, state_id, cases, cured, active, deaths)
        VALUES (
            '${districtName}',
            ${stateId},
            ${cases},
            ${cured},
            ${active},
            ${deaths}
    );
    `;

  const dbResponse = await db.run(postQuery);
  console.log(dbResponse.lastID);
  response.send("District Successfully Added");
});
