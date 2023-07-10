const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at 3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjecttoResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    lead_actor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  };
};

//Get movies List
app.get("/movies/", async (request, response) => {
  const getMoviesList = `
    SELECT movie_name FROM movie ORDER BY movie_id;`;
  const moviesArray = await db.all(getMoviesList);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjecttoResponseObject(eachMovie))
  );
});

//Creates New Movie
app.post("/movies/", async (request, response) => {
  const newMovie = request.body;
  const { directorId, movieName, leadActor } = newMovie;
  const addMovie = `
    INSERT INTO 
    movie(director_id, movie_name, lead_actor)
    VALUES (
        ${directorId},
        '${movieName}',
        '${leadActor}'
    );`;
  const dbResponse = await db.run(addMovie);
  response.send("Movie Successfully Added");
});

//Return a movie
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
        *
    FROM 
        movie
    WHERE 
        movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertDbObjecttoResponseObject(movie));
});

//update details of a movie
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovie = `
        UPDATE movie
        SET 
            director_id = ${directorId},
            movie_name =   '${movieName}',
            lead_actor = '${leadActor}'
        WHERE movie_id = ${movieId};
    `;
  await db.run(updateMovie);
  response.send("Movie Details Updated");
});

// Delete a Movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
        DELETE FROM movie WHERE movie_id = ${movieId};
    `;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

//Get List of all Directors
app.get("/directors/", async (request, response) => {
  const getDirectorsList = `
        SELECT * FROM director ORDER BY director_id;`;
  const directorList = await db.all(getDirectorsList);
  response.send(
    directorList.map((eachMovie) => convertDbObjecttoResponseObject(eachMovie))
  );
});

///
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getmovieDetails = `
        SELECT movie_name FROM movie WHERE director_id = ${directorId};
    `;
  const moviesList = await db.all(getmovieDetails);
  response.send(moviesList);
});
