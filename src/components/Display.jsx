import { Route, Routes, useLocation } from "react-router-dom"
import DisplayHome from "./DisplayHome"
import DisplayAlbum from "./DisplayAlbum"
import { useContext, useEffect, useState } from "react"
import { PlayerContext } from "../context/PlayerContext";

// O Vite busca automaticamente todas as imagens na pasta
const imageModules = import.meta.glob('../assets/backgrounds/*.{jpg,jpeg,png,webp}', { eager: true });
const backgrounds = Object.values(imageModules).map(module => module.default);

function Display() {
    const { albumsData } = useContext(PlayerContext);
    const [currentBgIndex, setCurrentBgIndex] = useState(0);
    const location = useLocation();
    
    const isAlbum = location.pathname.includes("album");
    const albumId = isAlbum ? location.pathname.split('/').pop() : "";

    // CORREÇÃO: Busca o álbum comparando tanto _id quanto id de forma flexível (string/número)
    const albumData = isAlbum && albumsData.length > 0 
        ? albumsData.find((album) => String(album._id || album.id) === String(albumId)) 
        : null;

    const bgColor = albumData ? albumData.bgColour : "#121212";

    // Lógica do carrossel automático
    useEffect(() => {
        if (!isAlbum && backgrounds.length > 0) {
            const interval = setInterval(() => {
                setCurrentBgIndex((prev) => (prev + 1) % backgrounds.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [isAlbum]);

    return (
        <div className="relative w-[100%] m-2 rounded text-white lg:w-[75%] lg:ml-0 overflow-hidden h-full">
            
            {/* Camada de Fundo Dinâmica com Transição Suave (Fade) */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {/* Fundo Padrão / Álbum */}
                <div 
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isAlbum ? 'opacity-100' : 'opacity-0'}`}
                    style={{ background: `linear-gradient(${bgColor}, #121212)`, backgroundSize: "100% 100%" }}
                />

                {/* Carrossel de Imagens de Fundo na Home */}
                {backgrounds.map((img, index) => (
                    <div
                        key={img}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            !isAlbum && index === currentBgIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                        style={{
                            backgroundImage: `linear-gradient(to bottom, rgb(0, 0, 0) 0%, rgba(8, 8, 8, 0.87) 30%, rgba(18, 18, 18, 0.75) 50%), url(${img})`,
                            backgroundSize: "100% 100%",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat"
                        }}
                    />
                ))}
            </div>

            {/* Conteúdo da Página */}
            <div className="relative z-10 w-full h-full overflow-y-auto px-6 pt-4 pb-24">
                {albumsData.length > 0 ?
                    <Routes>
                        <Route path="/" element={<DisplayHome />} />
                        <Route path="/album/:id" element={<DisplayAlbum album={albumData} />} />
                    </Routes>
                    : null}
            </div>

        </div>
    )
}

export default Display;