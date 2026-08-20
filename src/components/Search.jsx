import { useContext, useState, useEffect, useRef } from 'react';
import { PlayerContext } from '../context/PlayerContext';
import AlbumItem from './AlbumItem';
import SongsItem from './SongsItem';
import Navbar from './Navbar';

const Search = () => {
    const { songsData, albumsData } = useContext(PlayerContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredAlbums, setFilteredAlbums] = useState([]);
    const [filteredSongs, setFilteredSongs] = useState([]);
    const inputRef = useRef(null);

    // Foco automático no input ao montar (efeito suave)
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Filtra sempre que o termo mudar
    useEffect(() => {
        const term = searchTerm.toLowerCase().trim();
        if (term === '') {
            setFilteredAlbums([]);
            setFilteredSongs([]);
            return;
        }

        // Filtra álbuns pelo nome ou descrição
        const filteredAlbumsResult = albumsData.filter(
            (album) =>
                album.name.toLowerCase().includes(term) ||
                album.desc.toLowerCase().includes(term)
        );

        // Filtra músicas pelo nome, descrição ou álbum
        const filteredSongsResult = songsData.filter(
            (song) =>
                song.name.toLowerCase().includes(term) ||
                song.desc.toLowerCase().includes(term) ||
                song.album.toLowerCase().includes(term)
        );

        setFilteredAlbums(filteredAlbumsResult);
        setFilteredSongs(filteredSongsResult);
    }, [searchTerm, albumsData, songsData]);

    return (
        <div className="w-full h-full flex flex-col">
            <Navbar />
            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24">
                {/* Campo de busca com animação suave */}
                <div className="transition-all duration-500 ease-in-out transform">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="O que você quer ouvir?"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#2a2a2a] text-white text-lg py-3 px-6 rounded-full outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 placeholder-gray-400"
                    />
                </div>

                {/* Resultados */}
                {searchTerm.trim() === '' ? (
                    <div className="mt-10 text-center text-gray-400">
                        <p className="text-xl">Digite algo para começar a buscar</p>
                        <p className="text-sm mt-2">Álbuns, músicas, artistas...</p>
                    </div>
                ) : (
                    <>
                        {/* Álbuns encontrados */}
                        {filteredAlbums.length > 0 && (
                            <div className="mt-8">
                                <h2 className="text-2xl font-bold text-white mb-4">Álbuns</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
                                    {filteredAlbums.map((album) => (
                                        <AlbumItem
                                            key={album.id}
                                            image={album.image}
                                            name={album.name}
                                            desc={album.desc}
                                            id={album.id}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Músicas encontradas */}
                        {filteredSongs.length > 0 && (
                            <div className="mt-8">
                                <h2 className="text-2xl font-bold text-white mb-4">Músicas</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
                                    {filteredSongs.map((song) => (
                                        <SongsItem
                                            key={song.id}
                                            image={song.image}
                                            name={song.name}
                                            desc={song.desc}
                                            id={song.id}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Nenhum resultado */}
                        {filteredAlbums.length === 0 && filteredSongs.length === 0 && (
                            <div className="mt-10 text-center text-gray-400">
                                <p className="text-xl">Nenhum resultado encontrado para "{searchTerm}"</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Search