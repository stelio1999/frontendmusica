import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from './../assets/frontend-assets/assets';
import { PlayerContext } from '../context/PlayerContext';
import { useContext } from 'react';

function Sidebar() {
    const navigate = useNavigate();
    const [isSearching, setIsSearching] = useState(false);
    const { searchQuery, setSearchQuery } = useContext(PlayerContext);

    const handleSearchClick = () => {
        setIsSearching(true);
        navigate("/"); 
    };

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className='w-[25%] h-full p-2 flex-col gap-2 text-white hidden lg:flex'>
             
            {/* Bloco do Logotipo */}
            <div className="bg-[#000] h-[12%] rounded flex items-center pl-8 gap-3 cursor-pointer" onClick={() => navigate("/")}>
                <img className='w-10' src={assets.spotify_logo} alt="Logo" />
                <span className='font-bold text-lg tracking-wider'>swbstudios</span>
            </div>

            <div className="bg-[#121212] h-[15%] rounded flex flex-col justify-around px-4">
                <div onClick={() => navigate("/")} className="flex items-center gap-3 pl-4 cursor-pointer hover:text-gray-300 transition-colors">
                    <img className='w-6' src={assets.home_icon} alt="home icon" />
                    <p className='font-bold'>Pagina Inicial</p>
                </div>

                {/* Bloco Procurar com Transição Suave */}
                <div className="relative flex items-center pl-4">
                    {!isSearching ? (
                        <div onClick={handleSearchClick} className="flex items-center gap-3 w-full cursor-pointer hover:text-gray-300 transition-colors">
                            <img className='w-6' src={assets.search_icon} alt="search icon" />
                            <p className='font-bold'>Procurar</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 w-full transition-all duration-300">
                            <img className='w-5 opacity-70' src={assets.search_icon} alt="search icon" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="O que você quer ouvir?"
                                value={searchQuery}
                                onChange={handleInputChange}
                                onBlur={() => { if (!searchQuery) setIsSearching(false); }}
                                className="bg-[#242424] text-white text-sm rounded-full px-3 py-1.5 w-full outline-none focus:ring-1 focus:ring-white transition-all"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-[#121212] h-[85%] rounded">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img className='w-8' src={assets.stack_icon} alt="stack_icon" />
                        <p className="font-semibold">Sua Biblioteca</p>
                    </div>
                    <div className='flex items-center gap-3'>
                        <img className='w-5' src={assets.arrow_icon} alt="arrow_icon" />
                        <img className='w-5' src={assets.plus_icon} alt="plus_icon" />
                    </div>
                </div>
                <div className="p-4 bg-[#242424] m-2 rounded font-semibold flex flex-col items-start justify-start gap-1 pl-4">
                    <h1>Crie sua Lista de interesses</h1>
                    <p className='font-light'>Nos ajudamos voce com isso</p>
                    <button className='px-4 py-1.5 bg-white text-[15px] text-black rounded-full mt-4'>Criarlista</button>
                </div>
                <div className="p-4 bg-[#242424] m-2 rounded font-semibold flex flex-col items-start justify-start mt-4 gap-1 pl-4">
                    <h1>Aqui podem passar anuncios</h1>
                </div>
            </div>
        </div>
    )
}

export default Sidebar;