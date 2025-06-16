//Import useState to detect changes in the state and re-render components 
import { useState } from "react";
//Use axios to the APIs
import axios from "axios";
//Connecting to css file for styling 
import "./SoundCloud.css"; 

export default function SoundCloud(){
    //Stores search query user inputs 
    const [searchQuery, setSearchQuery] = useState("");
    //Stores the search results from the Google Custom search API
    const [searchResults, setSearchResults] = useState([]);
    //Stores the emebed code for the song user selected 
    const [embedCode, setEmbedCode] = useState("");

    //API keys for Google Custom Search 
    const google_api_key = "AIzaSyBJcLNXS5KazHLCV2yjNkpaDGOGgdLuy-U";
    const google_cx = "c7b07b8214c624a79";

    /*Take put the search query into the Google Custom Search API and limit results to only to SoundCloud links
    Then, filter the 10 results to only include SoundCloud track links by checking for 5 "/" in the URL so it's only tracks or playlists and not artist pages
    Save the filtered results to searchResults*/
    async function getSearchQuery(){
        const response = await axios.get("https://www.googleapis.com/customsearch/v1", {
        params: {
            key: google_api_key,
            cx: google_cx,
            q: `site:soundcloud.com ${searchQuery}`,
        },
        });

        const allResults = response.data.items;
        const trackLinks = [];
        console.log("Search Results:", allResults);

        for (const item of allResults){
            const url = item.link;
            console.log(item);
            const splitURL = url.split("/");
            if(splitURL.length >= 5){
                trackLinks.push(item);
            }
        }

        setSearchResults(trackLinks);
    }

    /*Takes the URL of the song user selected and sends it to SoundCloud oEmbed API to get the embed code
    Then, extract the src from the embed code and save it to embedCode 
    If there isn't a src, set embedCode to an empty string*/
    async function getEmbedCode(chosenUrl){
        try{
            const response = await axios.get("https://soundcloud.com/oembed",{
                params: {
                    format: "json",
                    url: chosenUrl,
                },
            });
            const data = response.data;
            const match = data.html.match(/src="([^"]+)"/);
            const embedUrl = match ? match[1] : "";
            setEmbedCode(embedUrl);
        }
        catch(error){
            console.error("Error fetching embed code:", error);
        }
    };

    //Updates the search query state when user types in the search box
    function updateSearchQuery(newSearchQuery){
        setSearchQuery(newSearchQuery);
    }

    return(
        <div id = "soundCloud">
            {/*Searchbox holds text box, search button, and results*/}
            <div id = "searchBox">
                {/*Everytime text inside searchText changes, searchQuery is updated*/}
                <input id = "searchText" value = {searchQuery} onChange = {e => updateSearchQuery(e.target.value)} placeholder = "Enter a song or playlist"></input>
                {/*If search button is clicked, React will send searchQuery to Google Custom search API*/}
                <button id = "searchButton" onClick = {getSearchQuery}> Search </button>
                <br></br>
                <div id = "searchResults">
                    {/*Outputs the search list out with image of the song cover and song title*/}
                    <div id = "searchList">
                        {searchResults.map((result, index) => (
                        <div key = {index} id = "searchItem">
                            <img
                                src = {result.pagemap.cse_image[0].src}
                                alt = "cover"
                                id = "cover-image"
                            />
                            <div id = "songInfo">
                                {/*When user clicks on the song title, it will call getEmbedCode with the link of the song*/}
                                <a href = {result.link} target = "_blank" rel = "noopener noreferrer" onClick = {e => {getEmbedCode(result.link);}}> {result.title} </a>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            </div>
            <br></br>
            {/*Calls SoundCloud widget API and changes the src of embed code depending on what user wants and defaults emebed code to a study music playlist*/}
            <div id = "musicPlayer">
                <iframe id = "soundcloud-player" src = {embedCode ? embedCode : "https://w.soundcloud.com/player/?visual=true&url=https%3A%2F%2Fapi.soundcloud.com%2Fplaylists%2F222896338&show_artwork=true"}/>
            </div>
        </div>
    )
}