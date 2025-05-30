import { useState } from "react";
import axios from "axios";
import "./SoundCloud.css"; 

export default function SoundCloud(){
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [embedCode, setEmbedCode] = useState("");

    const google_api_key = "AIzaSyBJcLNXS5KazHLCV2yjNkpaDGOGgdLuy-U";
    const iframely_api_key = "367fc2e9522cccbe43d012";
    const google_cx = "c7b07b8214c624a79";

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

    async function getEmbedCode(chosenUrl){
        try {
            const response = await axios.get("https://iframe.ly/api/iframely",{
                params: {
                url: chosenUrl,
                api_key: iframely_api_key
                },
            });

            console.log("Requested URL:", chosenUrl);
            const data = response.data;
            const embedUrl = data.links.player[0].href;
            console.log(embedUrl);
            setEmbedCode(embedUrl);
        }
        catch(error){
        console.error("Error fetching embed code:", error);
        }
    };

    function updateSearchQuery(newSearchQuery){
        setSearchQuery(newSearchQuery);
    }

    return(
        <div id = "soundCloud">
            <div id = "searchBox">
                <input id = "searchText" value = {searchQuery} onChange = {e => updateSearchQuery(e.target.value)} placeholder = "Enter a song or playlist"></input>
                <button id = "searchButton" onClick = {getSearchQuery}> Search </button>
                <div id = "searchResults">
                    <h1> Search Results </h1>
                    <div id = "searchList">
                        {searchResults.map((result, index) => (
                        <div key = {index} id = "searchItem">
                            <img
                                src = {result.pagemap.cse_image[0].src}
                                alt = "cover"
                                id = "cover-image"
                            />
                            <div id = "songInfo">
                                <a href = {result.link} target = "_blank" rel = "noopener noreferrer" onClick = {e => {e.preventDefault(); getEmbedCode(result.link);}}> {result.title} </a>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className = "musicPlayer">
                <iframe className = "soundcloud-player" src = {embedCode ? embedCode : "https://w.soundcloud.com/player/?visual=true&url=https%3A%2F%2Fapi.soundcloud.com%2Fplaylists%2F222896338&show_artwork=true"} allowFullScreen/>
            </div>
        </div>
    )
}