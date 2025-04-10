import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/AdminPage.css";
import { fetchAllMovies } from "../api/MovieAPI";
import { useRole } from "../context/RoleContext";
import AuthorizeView from "../components/AuthorizeView";

// Define the Movie interface with all necessary fields
interface Movie {
  showId: string;
  typeField: string;
  title: string;
  director?: string;
  castField?: string;
  country?: string;
  releaseYear: number;
  rating?: string;
  duration?: string;
  description: string;
  posterUrl: string;
  action: number;
  adventure: number;
  animeSeriesInternationalTvShows: number;
  britishTvShowsDocuseriesInternationalTvShows: number;
  children: number;
  comedies: number;
  comediesDramasInternationalMovies: number;
  comediesInternationalMovies: number;
  comediesRomanticMovies: number;
  crimeTvShowsDocuseries: number;
  documentaries: number;
  documentariesInternationalMovies: number;
  docuseries: number;
  dramas: number;
  dramasInternationalMovies: number;
  dramasRomanticMovies: number;
  familyMovies: number;
  fantasy: number;
  horrorMovies: number;
  internationalMoviesThrillers: number;
  internationalTvShowsRomanticTvShowsTvDramas: number;
  kidsTv: number;
  languageTvShows: number;
  musicals: number;
  natureTv: number;
  realityTv: number;
  spirituality: number;
  tvAction: number;
  tvComedies: number;
  tvDramas: number;
  talkShowsTvComedies: number;
  thrillers: number;
}

// Genre options for the single-select dropdown
const genreMap = [
  { key: "action", label: "Action" },
  { key: "adventure", label: "Adventure" },
  { key: "animeSeriesInternationalTvShows", label: "Anime" },
  {
    key: "britishTvShowsDocuseriesInternationalTvShows",
    label: "British/Docuseries/Intl TV",
  },
  { key: "children", label: "Children" },
  { key: "comedies", label: "Comedies" },
  {
    key: "comediesDramasInternationalMovies",
    label: "Comedies/Dramas/Intl Movies",
  },
  { key: "comediesInternationalMovies", label: "Intl Comedies" },
  { key: "comediesRomanticMovies", label: "Romantic Comedies" },
  { key: "crimeTvShowsDocuseries", label: "Crime/Docuseries" },
  { key: "documentaries", label: "Documentaries" },
  { key: "documentariesInternationalMovies", label: "Intl Documentaries" },
  { key: "docuseries", label: "Docuseries" },
  { key: "dramas", label: "Dramas" },
  { key: "dramasInternationalMovies", label: "Intl Dramas" },
  { key: "dramasRomanticMovies", label: "Romantic Dramas" },
  { key: "familyMovies", label: "Family" },
  { key: "fantasy", label: "Fantasy" },
  { key: "horrorMovies", label: "Horror" },
  { key: "internationalMoviesThrillers", label: "Intl Thrillers" },
  {
    key: "internationalTvShowsRomanticTvShowsTvDramas",
    label: "Intl/Romantic/TV Dramas",
  },
  { key: "kidsTv", label: "Kids TV" },
  { key: "languageTvShows", label: "Language TV" },
  { key: "musicals", label: "Musicals" },
  { key: "natureTv", label: "Nature TV" },
  { key: "realityTv", label: "Reality TV" },
  { key: "spirituality", label: "Spirituality" },
  { key: "tvAction", label: "TV Action" },
  { key: "tvComedies", label: "TV Comedies" },
  { key: "tvDramas", label: "TV Dramas" },
  { key: "talkShowsTvComedies", label: "Talk Shows/TV Comedies" },
  { key: "thrillers", label: "Thrillers" },
];

const subGenreMap: { [key: string]: string[] } = {
  action: ["action", "tvAction"],
  adventure: ["adventure"],
  anime: ["animeSeriesInternationalTvShows"],
  british: ["britishTvShowsDocuseriesInternationalTvShows"],
  children: ["children"],
  comedies: [
    "comedies",
    "tvComedies",
    "comediesInternationalMovies",
    "comediesRomanticMovies",
    "comediesDramasInternationalMovies",
  ],
  crime: ["crimeTvShowsDocuseries"],
  docuseries: ["docuseries", "britishTvShowsDocuseriesInternationalTvShows"],
  dramas: [
    "dramas",
    "dramasInternationalMovies",
    "dramasRomanticMovies",
    "tvDramas",
    "internationalTvShowsRomanticTvShowsTvDramas",
  ],
  family: ["familyMovies", "children", "kidsTv"],
  fantasy: ["fantasy"],
  horror: ["horrorMovies"],
  international: [
    "animeSeriesInternationalTvShows",
    "britishTvShowsDocuseriesInternationalTvShows",
    "dramasInternationalMovies",
    "documentariesInternationalMovies",
    "comediesInternationalMovies",
    "internationalMoviesThrillers",
    "internationalTvShowsRomanticTvShowsTvDramas",
  ],
  musicals: ["musicals"],
  nature: ["natureTv"],
  reality: ["realityTv"],
  romance: ["internationalTvShowsRomanticTvShowsTvDramas"],
  spiritual: ["spirituality"],
  talkShows: ["talkShowsTvComedies"],
  thrillers: ["thrillers", "internationalMoviesThrillers"],
};

const years: number[] = [];
for (let y = new Date().getFullYear(); y >= 1900; y--) {
  years.push(y);
}

const AdminPage: React.FC = () => {
  const { role, isLoading } = useRole();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [, setError] = useState<string>("");

  // Filters
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>("all");
  const [genreFilters, setGenreFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("default");
  const [ratingFilter, setRatingFilter] = useState<string>("all");

  // Modal (for Add/Edit) state
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMovie, setCurrentMovie] = useState<Partial<Movie>>({});

  // New state for a single selected genre
  const [selectedGenre, setSelectedGenre] = useState<string>("");

  // For pagination
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    Promise.all([fetchAllMovies()])
      .then(([all]) => {
        setMovies(all);
      })
      .catch((err) => setError(err.message));
  }, []);

  // Show loading while checking role
  if (isLoading) {
    return (
      <div className="bg-black text-white min-vh-100 d-flex justify-content-center align-items-center">
        <h2>Loading...</h2>
      </div>
    );
  }

  // Block access if not Admin
  if (role !== "Administrator") {
    return (
      <div className="bg-black text-white min-vh-100 d-flex justify-content-center align-items-center">
        <h2>Access Denied: Admins Only</h2>
      </div>
    );
  }

  // Filter movies
  const filteredMovies = movies
    .filter((m) => m.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((m) => {
      if (mediaTypeFilter === "all") return true;
      if (mediaTypeFilter === "movie")
        return m.typeField?.toLowerCase().includes("movie");
      if (mediaTypeFilter === "tv")
        return m.typeField?.toLowerCase().includes("tv");
      return true;
    })
    .filter((m) => {
      if (genreFilters.length === 0) return true;
      return genreFilters.some((subGenre) =>
        subGenreMap[subGenre].some((field) => (m as any)[field] === 1)
      );
    })
    .filter((m) => {
      if (ratingFilter === "all") return true;
      return m.rating === ratingFilter;
    })
    .sort((a, b) => {
      if (sortBy === "titleAsc") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "titleDesc") {
        return b.title.localeCompare(a.title);
      } else {
        return 0; // ✅ No sorting — keep original DB order
      }
    });

  // Pagination
  const itemsPerPage = 10;
  const totalItems = filteredMovies.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);


  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const handleAddMovie = () => {
    setIsAdding(true);
    setCurrentMovie({
      showId: "",
      typeField: "",
      title: "",
      director: "",
      castField: "",
      country: "",
      releaseYear: 0,
      rating: "",
      duration: "",
      description: "",
      posterUrl: "",
      action: 0,
      adventure: 0,
      animeSeriesInternationalTvShows: 0,
      britishTvShowsDocuseriesInternationalTvShows: 0,
      children: 0,
      comedies: 0,
      comediesDramasInternationalMovies: 0,
      comediesInternationalMovies: 0,
      comediesRomanticMovies: 0,
      crimeTvShowsDocuseries: 0,
      documentaries: 0,
      documentariesInternationalMovies: 0,
      docuseries: 0,
      dramas: 0,
      dramasInternationalMovies: 0,
      dramasRomanticMovies: 0,
      familyMovies: 0,
      fantasy: 0,
      horrorMovies: 0,
      internationalMoviesThrillers: 0,
      internationalTvShowsRomanticTvShowsTvDramas: 0,
      kidsTv: 0,
      languageTvShows: 0,
      musicals: 0,
      natureTv: 0,
      realityTv: 0,
      spirituality: 0,
      tvAction: 0,
      tvComedies: 0,
      tvDramas: 0,
      talkShowsTvComedies: 0,
      thrillers: 0,
    });
    setSelectedGenre("");
  };

  const handleEditMovie = (movie: Movie) => {
    setIsEditing(true);
    setCurrentMovie(movie);
    // If exactly one genre is true, set that as selected
    for (const g of genreMap) {
      if ((movie as any)[g.key] === 1) {
        setSelectedGenre(g.key);
        break;
      }
    }
  };

  const handleDeleteMovie = async (showId: string) => {
    if (role !== "Administrator") {
      alert("You do not have permission to delete movies.");
      return;
    }
  
    if (!window.confirm("Are you sure you want to delete this movie?")) return;
  
    try {
      const response = await fetch(
        `https://localhost:5000/api/Admin/Movies/${showId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
  
      if (response.ok) {
        setMovies((prev) => prev.filter((m) => m.showId !== showId));
      } else {
        console.error("Failed to delete movie:", response.status);
        alert("Failed to delete movie. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting movie:", error);
      alert("An error occurred while trying to delete the movie.");
    }
  };  

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (role !== "Administrator") {
      alert("You do not have permission to add or edit movies.");
      return;
    }

    const updatedMovie = { ...currentMovie } as any;

    // Handle genre selection
    genreMap.forEach((g) => {
      updatedMovie[g.key] = g.key === selectedGenre ? 1 : 0;
    });

    if (isAdding) {
      try {
        const payload = { ...updatedMovie };
        delete payload.showId; // Remove showId when adding new movie
        console.log(JSON.stringify(payload, null, 2));
        const response = await fetch(
          "https://localhost:5000/api/Admin/Movies",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            credentials: "include",
          }
        );

        if (response.ok) {
          const newMovie: Movie = await response.json();
          setMovies((prev) => [...prev, newMovie]);
        } else {
          console.error("Add movie failed:", response.status);
          alert("Failed to add the movie. Please try again.");
        }
      } catch (error) {
        console.error("Error adding movie:", error);
        alert("An error occurred while adding the movie.");
      }
      setIsAdding(false);
    } else if (isEditing && currentMovie.showId) {
      console.log("Updating movie with id:", currentMovie.showId);
      try {
        const response = await fetch(
          `https://localhost:5000/api/Admin/Movies/${currentMovie.showId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedMovie),
            credentials: "include",
          }
        );

        if (response.ok) {
          const updatedMovieResponse: Movie = await response.json();
          setMovies((prev) =>
            prev.map((m) =>
              m.showId === updatedMovieResponse.showId
                ? updatedMovieResponse
                : m
            )
          );
        } else {
          console.error("Failed to update movie:", response.status);
          alert("Failed to update movie. Please try again.");
        }
      } catch (error) {
        console.error("Error updating movie:", error);
        alert("An error occurred while updating the movie.");
      }

      setIsEditing(false);
    }
  };

  // Helper to generate a comma-separated genre string for table display.
  const computeGenreLabel = (movie: Movie): string => {
    let genres: string[] = [];
    genreMap.forEach((g) => {
      if ((movie as any)[g.key] === 1) {
        genres.push(g.label);
      }
    });
    return genres.length > 0 ? genres.join(", ") : "N/A";
  };

  // Modal overlay click closes the modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsAdding(false);
      setIsEditing(false);
      setCurrentMovie({});
      setSelectedGenre("");
    }
  };

  return (
    <AuthorizeView>
      <div className="bg-black text-white min-vh-100">
        <Header />
        <br />
        <br />
        <div className="admin-manage-container">
          <h1>Manage Movies</h1>

          {/* Search Row */}
          <div className="search-row">
            <input
              type="text"
              placeholder="Search for a movie..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="search-bar"
            />
            <button className="btn add-movie-btn" onClick={handleAddMovie}>
              + Add Movie
            </button>
          </div>

          <div className="filter-sort-menu">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1); // ✅ reset to page 1 on sort change
              }}
            >
              <option value="default">Sort</option>
              <option value="titleAsc">Title (A-Z)</option>
              <option value="titleDesc">Title (Z-A)</option>
            </select>

            <select
              value={mediaTypeFilter}
              onChange={(e) => setMediaTypeFilter(e.target.value)}
            >
              <option value="all">All Media</option>
              <option value="movie">Movies</option>
              <option value="tv">TV Shows</option>
            </select>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="G">G</option>
              <option value="PG">PG</option>
              <option value="PG-13">PG-13</option>
              <option value="R">R</option>
              <option value="NC-17">NC-17</option>
              <option value="TV-Y">TV-Y</option>
              <option value="TV-Y7">TV-Y7</option>
              <option value="TV-G">TV-G</option>
              <option value="TV-PG">TV-PG</option>
              <option value="TV-14">TV-14</option>
              <option value="TV-MA">TV-MA</option>
            </select>

            {/* Genre filter */}
            <select
              value={genreFilters[0] || ""}
              onChange={(e) => {
                setGenreFilters(e.target.value ? [e.target.value] : []);
                setCurrentPage(1);
              }}
            >
              <option value="">All Genres</option>
              {Object.keys(subGenreMap).map((genre) => (
                <option key={genre} value={genre}>
                  {genre.charAt(0).toUpperCase() + genre.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <br></br>

          {/* Movie Table */}
          <table className="admin-movie-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Director</th>
                <th>Release Year</th>
                <th>Genres</th>
                <th>Rating</th>
                <th>Edit/Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovies
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((movie) => (
                  <tr key={movie.showId}>
                    <td>{movie.title}</td>
                    <td>{movie.typeField || "N/A"}</td>
                    <td>{movie.director || "N/A"}</td>
                    <td>{movie.releaseYear}</td>
                    <td>{computeGenreLabel(movie)}</td>
                    <td>{movie.rating || "N/A"}</td>
                    <td>
                      <button
                        className="btn edit-btn"
                        onClick={() => handleEditMovie(movie)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn delete-btn"
                        onClick={() => handleDeleteMovie(movie.showId)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              {filteredMovies.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center" }}>
                    No Movies Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination-controls">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>

        {/* Modal for Add/Edit */}
        {(isAdding || isEditing) && (
          <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{isAdding ? "Add Movie" : "Edit Movie"}</h2>
              <form onSubmit={handleFormSubmit} id="movieForm">
                <div className="modal-body">
                  <div className="form-group">
                    <label>Title:</label>
                    <input
                      type="text"
                      value={currentMovie.title || ""}
                      onChange={(e) =>
                        setCurrentMovie((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Type:</label>
                    <select
                      value={currentMovie.typeField || ""}
                      onChange={(e) =>
                        setCurrentMovie((prev) => ({
                          ...prev,
                          typeField: e.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">-- Select Type --</option>
                      <option value="Movie">Movie</option>
                      <option value="TV Show">TV Show</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Director:</label>
                    <input
                      type="text"
                      value={currentMovie.director || ""}
                      onChange={(e) =>
                        setCurrentMovie((prev) => ({
                          ...prev,
                          director: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Cast:</label>
                    <input
                      type="text"
                      value={currentMovie.castField || ""}
                      onChange={(e) =>
                        setCurrentMovie((prev) => ({
                          ...prev,
                          castField: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Country:</label>
                    <input
                      type="text"
                      value={currentMovie.country || ""}
                      onChange={(e) =>
                        setCurrentMovie((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Release Year:</label>
                    <select
                      value={currentMovie.releaseYear || ""}
                      onChange={(e) =>
                        setCurrentMovie((prev) => ({
                          ...prev,
                          releaseYear: Number(e.target.value),
                        }))
                      }
                      required
                    >
                      <option value="">-- Select Year --</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>MPAA/TV Rating:</label>
                    <select
                      value={currentMovie.rating || ""}
                      onChange={(e) =>
                        setCurrentMovie((prev) => ({
                          ...prev,
                          rating: e.target.value,
                        }))
                      }
                    >
                      <option value="">-- Select Rating --</option>
                      <option value="G">G</option>
                      <option value="PG">PG</option>
                      <option value="PG-13">PG-13</option>
                      <option value="R">R</option>
                      <option value="NC-17">NC-17</option>
                      <option value="TV-Y">TV-Y</option>
                      <option value="TV-Y7">TV-Y7</option>
                      <option value="TV-G">TV-G</option>
                      <option value="TV-PG">TV-PG</option>
                      <option value="TV-14">TV-14</option>
                      <option value="TV-MA">TV-MA</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Duration:</label>
                    <input
                      type="text"
                      value={currentMovie.duration || ""}
                      onChange={(e) =>
                        setCurrentMovie((prev) => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea
                      value={currentMovie.description || ""}
                      onChange={(e) =>
                        setCurrentMovie((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Poster URL:</label>
                    <input
                      type="text"
                      value={currentMovie.posterUrl || ""}
                      onChange={(e) =>
                        setCurrentMovie((prev) => ({
                          ...prev,
                          posterUrl: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  {/* Genre Section: Single-select dropdown */}
                  <div className="form-group">
                    <label>Genre:</label>
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      required
                    >
                      <option value="">-- Select a Genre --</option>
                      {genreMap.map((g) => (
                        <option key={g.key} value={g.key}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-buttons">
                  <button type="submit" className="btn save-btn">
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn cancel-btn"
                    onClick={() => {
                      setIsAdding(false);
                      setIsEditing(false);
                      setCurrentMovie({});
                      setSelectedGenre("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </AuthorizeView>
  );
};

export default AdminPage;