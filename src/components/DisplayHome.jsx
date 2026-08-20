import { useContext } from "react"
import AlbumItem from "./AlbumItem"
import Navbar from "./Navbar"
import SongsItem from "./SongsItem"
import { PlayerContext } from './../context/PlayerContext';

function DisplayHome() {
    const { songsData, albumsData, searchQuery } = useContext(PlayerContext)

    // Filtra álbuns e músicas baseados no texto digitado na pesquisa
    const filteredAlbums = albumsData.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredSongs = songsData.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <Navbar />
            {/* Seção de Albuns */}
            <div className="mb-4">
                <h1 className="my-5 font-bold text-2xl">
                    {searchQuery ? `Resultados para "${searchQuery}"` : "Álbuns em destaque"}
                </h1>
                
                {filteredAlbums.length === 0 && filteredSongs.length === 0 ? (
                    <p className="text-gray-400 text-sm mt-4">Nenhum resultado encontrado.</p>
                ) : null}

                {filteredAlbums.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-6">
                        {filteredAlbums.map((item, index) => (
                            <AlbumItem
                                key={index}
                                image={item.image}
                                name={item.name}
                                desc={item.desc}
                                id={item.id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Seção de Músicas */}
            {filteredSongs.length > 0 && (
                <div className="mb-4">
                    <h1 className="my-5 font-bold text-2xl">Músicas encontradas</h1>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-6">
                        {filteredSongs.map((item, index) => (
                            <SongsItem
                                key={index}
                                image={item.image}
                                name={item.name}
                                desc={item.desc}
                                id={item.id}
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}

export default DisplayHome;