import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import { assets } from '../assets/frontend-assets/assets';
import { PlayerContext } from '../context/PlayerContext';
import { useContext, useState, useMemo } from 'react';

const DisplayAlbum = ({ album }) => {
    const { id } = useParams();
    const { playWithId, albumsData, songsData, track, play, pause, playStatus } = useContext(PlayerContext);
    const [hoveredSongId, setHoveredSongId] = useState(null);

    // Busca o álbum (pode vir via prop ou via contexto)
    const albumData = album || albumsData.find((item) => String(item.id) === String(id));

    // Filtra as músicas do álbum atual
    const albumSongs = useMemo(() => {
        if (!albumData) return [];
        return songsData.filter((item) => item.album === albumData.name);
    }, [songsData, albumData]);

    // Calcula o total de músicas e a duração total
    const totalSongs = albumSongs.length;
    const totalDurationInSeconds = albumSongs.reduce((acc, song) => {
        // A duração está no formato "MM:SS" (ex: "3:45")
        const parts = song.duration.split(':').map(Number);
        if (parts.length === 2) {
            return acc + parts[0] * 60 + parts[1];
        }
        return acc; // fallback
    }, 0);

    // Formata a duração total em "X hr. Y min." ou "Y min."
    const formatDuration = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        if (hours > 0) {
            return `${hours} hr. ${minutes} min.`;
        }
        return `${minutes} min.`;
    };

    const handleMouseEnter = (songId) => {
        setHoveredSongId(songId);
    };

    const handleMouseLeave = () => {
        setHoveredSongId(null);
    };

    return albumData ? (
        <>
            <Navbar />
            <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end">
                <img className='w-48 rounded shadow-2xl' src={albumData.image} alt="" />
                <div className="flex flex-col gap-3">
                    <p className="text-sm font-medium">Ficha Tecnica</p>
                    <h2 className='text-5xl font-bold mb-2 md:text-7xl'>{albumData.name}</h2>
                    <h4 className="text-gray-300 text-sm md:text-base">{albumData.desc}</h4>
                    <div className='flex items-center gap-2 text-sm mt-1'>
                        <img className='inline-block w-5' src={assets.spotify_logo} alt="SWBstudios_logo" />
                        <b className='font-bold'>SWBstudios</b>
                        <span className='text-gray-300'>• 0 likes</span>
                        <span className='text-gray-300 hidden sm:inline'>
                            • {totalSongs} músicas, com duração aproximada de {formatDuration(totalDurationInSeconds)}
                        </span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-[0.5fr_2fr_2fr_0.5fr] mt-10 mb-4 pl-2 text-[#a7a7a7] border-b border-[#ffffff1a] pb-2">
                <p># <span className='ml-4'>Título</span></p>
                <p>Nome</p>
                <p className='hidden sm:block'>Data de adição

</p>
                <img className='m-auto w-4' src={assets.clock_icon} alt="clock_icon" />
            </div>

            {albumSongs.map((item, index) => (
                <div
                    key={item.id || index}
                    onClick={() => hoveredSongId === item.id && playStatus ? pause() : playWithId(item.id)}
                    className="grid grid-cols-3 sm:grid-cols-[0.5fr_2fr_2fr_0.5fr] gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff26] rounded-md cursor-pointer transition-colors"
                    onMouseEnter={() => handleMouseEnter(item.id)}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className='flex items-center'>
                        {track && track.id === item.id && playStatus ?
                            <img className='m-auto w-4 mr-4' src={assets.pause_icon} alt="pause" />
                            : hoveredSongId === item.id ? <img className='m-auto w-4 mr-4' src={assets.play_icon} alt="play" />
                                : <span className='mr-4 text-[#a7a7a7] font-medium'>{index + 1}</span>
                        }
                        <img className='inline-block w-10 h-10 rounded object-cover mr-4'
                            src={item.image}
                            alt=""
                        />
                    </div>
                    <p className='text-[15px] font-bold text-white truncate'>{item.name}</p>
                    <p className='text-[15px] hidden sm:block'>5 dias atraz</p>
                    <p className='text-[15px] text-center'>{item.duration}</p>
                </div>
            ))}
        </>
    ) : null;
};

export default DisplayAlbum;