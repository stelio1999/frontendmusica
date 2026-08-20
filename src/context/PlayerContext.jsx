import {
    createContext,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import axios from "axios";

export const PlayerContext = createContext();

const PlayerContextProvider = ({ children }) => {
    // =========================================================
    // CONFIGURAÇÃO
    // =========================================================

    const url =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

    // =========================================================
    // REFS
    // =========================================================

    const audioRef = useRef(null);
    const seekBar = useRef(null);
    const seekBg = useRef(null);

    // Evita chamadas simultâneas de play()
    const playRequestRef = useRef(null);

    // =========================================================
    // ESTADOS
    // =========================================================

    const [songsData, setSongsData] = useState([]);
    const [originalSongsData, setOriginalSongsData] = useState([]);
    const [albumsData, setAlbumsData] = useState([]);

    const [track, setTrack] = useState(null);

    const [playStatus, setPlayStatus] = useState(false);

    const [isLooping, setIsLooping] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);

    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");

    const [time, setTime] = useState({
        currentTime: {
            second: 0,
            minute: 0,
        },
        totalTime: {
            second: 0,
            minute: 0,
        },
    });

    // =========================================================
    // HELPERS
    // =========================================================

    const getAudioUrl = useCallback(
        (song) => {
            if (!song) return "";

            /*
             * Ajuste aqui caso o seu backend use outro campo.
             */

            const audioFile =
                song.file ||
                song.audio ||
                song.audioFile ||
                song.songFile ||
                song.url;

            if (!audioFile) {
                console.warn(
                    "Nenhum arquivo de áudio encontrado para:",
                    song
                );

                return "";
            }

            // Se já for uma URL completa
            if (
                audioFile.startsWith("http://") ||
                audioFile.startsWith("https://") ||
                audioFile.startsWith("blob:")
            ) {
                return audioFile;
            }

            // Se for caminho relativo
            return `${url}/${audioFile.replace(/^\/+/, "")}`;
        },
        [url]
    );

    const resetTime = useCallback(() => {
        setTime({
            currentTime: {
                second: 0,
                minute: 0,
            },
            totalTime: {
                second: 0,
                minute: 0,
            },
        });

        if (seekBar.current) {
            seekBar.current.style.width = "0%";
        }
    }, []);

    // =========================================================
    // PLAY
    // =========================================================

    const play = useCallback(async () => {
        const audio = audioRef.current;

        if (!audio || !track) return;

        try {
            /*
             * Se já existe uma chamada de play() em andamento,
             * não fazemos outra.
             */
            if (playRequestRef.current) {
                try {
                    await playRequestRef.current;
                } catch {
                    // Ignora erro da chamada anterior
                }
            }

            const request = audio.play();

            playRequestRef.current = request;

            await request;

            setPlayStatus(true);
        } catch (error) {
            /*
             * AbortError normalmente acontece quando o src
             * mudou enquanto play() estava sendo executado.
             *
             * Não precisamos mostrar isso como erro para o usuário.
             */
            if (error?.name === "AbortError") {
                return;
            }

            /*
             * NotAllowedError pode acontecer quando o navegador
             * bloqueia autoplay.
             */
            if (error?.name === "NotAllowedError") {
                console.warn(
                    "O navegador bloqueou a reprodução automática."
                );

                setPlayStatus(false);
                return;
            }

            console.error("Erro ao reproduzir áudio:", error);

            setPlayStatus(false);
        } finally {
            playRequestRef.current = null;
        }
    }, [track]);

    // =========================================================
    // PAUSE
    // =========================================================

    const pause = useCallback(() => {
        const audio = audioRef.current;

        if (!audio) return;

        audio.pause();

        setPlayStatus(false);
    }, []);

    // =========================================================
    // TOGGLE PLAY / PAUSE
    // =========================================================

    const togglePlay = useCallback(() => {
        if (!audioRef.current) return;

        if (audioRef.current.paused) {
            play();
        } else {
            pause();
        }
    }, [play, pause]);

    // =========================================================
    // SELECIONAR MÚSICA
    // =========================================================

    const selectSong = useCallback(
        (song, autoPlay = true) => {
            if (!song) return;

            /*
             * Primeiro paramos o áudio atual.
             */
            if (audioRef.current) {
                audioRef.current.pause();
            }

            /*
             * Atualizamos a música.
             */
            setTrack(song);

            /*
             * Indicamos que a nova música deverá tocar.
             *
             * O useEffect responsável pelo track fará o play
             * somente depois que o src estiver preparado.
             */
            setPlayStatus(autoPlay);
        },
        []
    );

    // =========================================================
    // PLAY WITH ID
    // =========================================================

    const playWithId = useCallback(
        (id) => {
            const selectedSong = songsData.find(
                (song) => song.id === id
            );

            if (!selectedSong) {
                console.warn(
                    `Música com ID ${id} não encontrada.`
                );

                return;
            }

            selectSong(selectedSong, true);
        },
        [songsData, selectSong]
    );

    // =========================================================
    // NEXT SONG
    // =========================================================

    const nextSong = useCallback(() => {
        if (!track || songsData.length === 0) return;

        const currentIndex = songsData.findIndex(
            (song) => song.id === track.id
        );

        if (currentIndex === -1) return;

        /*
         * Se chegou ao fim
         */
        if (currentIndex >= songsData.length - 1) {
            /*
             * Se estiver em loop, volta para a primeira.
             */
            if (isLooping) {
                selectSong(songsData[0], true);
            } else {
                pause();
            }

            return;
        }

        selectSong(
            songsData[currentIndex + 1],
            true
        );
    }, [
        track,
        songsData,
        isLooping,
        selectSong,
        pause,
    ]);

    // =========================================================
    // PREVIOUS SONG
    // =========================================================

    const previousSong = useCallback(() => {
        if (!track || songsData.length === 0) return;

        const audio = audioRef.current;

        /*
         * Se a música já passou de 3 segundos,
         * o botão anterior simplesmente reinicia a música.
         */
        if (audio && audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }

        const currentIndex = songsData.findIndex(
            (song) => song.id === track.id
        );

        if (currentIndex === -1) return;

        if (currentIndex === 0) {
            if (isLooping) {
                selectSong(
                    songsData[songsData.length - 1],
                    true
                );
            } else {
                audio.currentTime = 0;
            }

            return;
        }

        selectSong(
            songsData[currentIndex - 1],
            true
        );
    }, [
        track,
        songsData,
        isLooping,
        selectSong,
    ]);

    // =========================================================
    // LOOP
    // =========================================================

    const toggleLoop = useCallback(() => {
        setIsLooping((previous) => !previous);
    }, []);

    // =========================================================
    // SHUFFLE
    // =========================================================

    const shuffleArray = useCallback((array) => {
        const shuffled = [...array];

        for (
            let i = shuffled.length - 1;
            i > 0;
            i--
        ) {
            const j = Math.floor(
                Math.random() * (i + 1)
            );

            [shuffled[i], shuffled[j]] = [
                shuffled[j],
                shuffled[i],
            ];
        }

        return shuffled;
    }, []);

    const toggleShuffle = useCallback(() => {
        setIsShuffle((previous) => !previous);
    }, []);

    // =========================================================
    // APLICAR SHUFFLE
    // =========================================================

    useEffect(() => {
        if (originalSongsData.length === 0) return;

        if (isShuffle) {
            const shuffled = shuffleArray(
                originalSongsData
            );

            setSongsData(shuffled);
        } else {
            setSongsData(originalSongsData);
        }
    }, [
        isShuffle,
        originalSongsData,
        shuffleArray,
    ]);

    // =========================================================
    // VOLUME
    // =========================================================

    const handleVolumeChange = useCallback((e) => {
        const newVolume = Number(e.target.value);

        setVolume(newVolume);

        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }

        if (newVolume === 0) {
            setIsMuted(true);
        } else {
            setIsMuted(false);
        }
    }, []);

    // =========================================================
    // MUTE
    // =========================================================

    const toggleMute = useCallback(() => {
        if (!audioRef.current) return;

        if (isMuted) {
            const restoredVolume =
                volume > 0 ? volume : 0.5;

            audioRef.current.volume =
                restoredVolume;

            setVolume(restoredVolume);
            setIsMuted(false);
        } else {
            audioRef.current.volume = 0;

            setIsMuted(true);
        }
    }, [isMuted, volume]);

    // =========================================================
    // SEEK
    // =========================================================

    const seekSong = useCallback((e) => {
        const audio = audioRef.current;
        const background = seekBg.current;

        if (!audio || !background) return;

        if (!Number.isFinite(audio.duration)) {
            return;
        }

        const rect =
            background.getBoundingClientRect();

        const clickPosition =
            e.clientX - rect.left;

        const percentage =
            clickPosition / rect.width;

        const newTime =
            percentage * audio.duration;

        audio.currentTime = Math.max(
            0,
            Math.min(newTime, audio.duration)
        );
    }, []);

    // =========================================================
    // AUDIO - TRACK CHANGE
    // =========================================================

    useEffect(() => {
        const audio = audioRef.current;

        if (!audio || !track) return;

        const audioUrl = getAudioUrl(track);

        if (!audioUrl) {
            console.error(
                "Arquivo de áudio não encontrado:",
                track
            );

            setPlayStatus(false);
            return;
        }

        /*
         * Cancela a reprodução anterior.
         */
        audio.pause();

        /*
         * Remove o source anterior.
         */
        audio.removeAttribute("src");

        /*
         * Define o novo source.
         */
        audio.src = audioUrl;

        /*
         * Aplica configurações.
         */
        audio.loop = isLooping;
        audio.volume = isMuted ? 0 : volume;

        /*
         * Carrega a nova música.
         */
        audio.load();

        resetTime();

        /*
         * Só reproduz depois que o navegador estiver
         * pronto para reproduzir.
         */
        const handleCanPlay = async () => {
            if (!playStatus) return;

            try {
                await audio.play();
                setPlayStatus(true);
            } catch (error) {
                if (
                    error?.name !== "AbortError" &&
                    error?.name !== "NotAllowedError"
                ) {
                    console.error(
                        "Erro ao iniciar nova música:",
                        error
                    );
                }

                if (
                    error?.name === "NotAllowedError"
                ) {
                    setPlayStatus(false);
                }
            }
        };

        audio.addEventListener(
            "canplay",
            handleCanPlay
        );

        return () => {
            audio.removeEventListener(
                "canplay",
                handleCanPlay
            );

            audio.pause();
        };
    }, [
        track,
        getAudioUrl,
        isLooping,
        volume,
        isMuted,
        resetTime,
    ]);

    // =========================================================
    // AUDIO EVENTS
    // =========================================================

    useEffect(() => {
        const audio = audioRef.current;

        if (!audio) return;

        const handleTimeUpdate = () => {
            if (!Number.isFinite(audio.duration)) {
                return;
            }

            const currentSeconds =
                audio.currentTime || 0;

            const duration =
                audio.duration || 0;

            const percentage =
                duration > 0
                    ? (currentSeconds / duration) * 100
                    : 0;

            if (seekBar.current) {
                seekBar.current.style.width =
                    `${percentage}%`;
            }

            setTime({
                currentTime: {
                    second: Math.floor(
                        currentSeconds % 60
                    ),
                    minute: Math.floor(
                        currentSeconds / 60
                    ),
                },

                totalTime: {
                    second: Math.floor(
                        duration % 60
                    ),
                    minute: Math.floor(
                        duration / 60
                    ),
                },
            });
        };

        const handlePlay = () => {
            setPlayStatus(true);
        };

        const handlePause = () => {
            setPlayStatus(false);
        };

        const handleEnded = () => {
            /*
             * Se loop estiver ativo, o próprio audio.loop
             * cuidará da repetição.
             */
            if (!audio.loop) {
                nextSong();
            }
        };

        const handleError = (event) => {
            console.error(
                "Erro no elemento de áudio:",
                event
            );

            setPlayStatus(false);
        };

        audio.addEventListener(
            "timeupdate",
            handleTimeUpdate
        );

        audio.addEventListener(
            "play",
            handlePlay
        );

        audio.addEventListener(
            "pause",
            handlePause
        );

        audio.addEventListener(
            "ended",
            handleEnded
        );

        audio.addEventListener(
            "error",
            handleError
        );

        return () => {
            audio.removeEventListener(
                "timeupdate",
                handleTimeUpdate
            );

            audio.removeEventListener(
                "play",
                handlePlay
            );

            audio.removeEventListener(
                "pause",
                handlePause
            );

            audio.removeEventListener(
                "ended",
                handleEnded
            );

            audio.removeEventListener(
                "error",
                handleError
            );
        };
    }, [nextSong]);

    // =========================================================
    // LOOP
    // =========================================================

    useEffect(() => {
        if (!audioRef.current) return;

        audioRef.current.loop = isLooping;
    }, [isLooping]);

    // =========================================================
    // VOLUME
    // =========================================================

    useEffect(() => {
        if (!audioRef.current) return;

        audioRef.current.volume =
            isMuted ? 0 : volume;
    }, [volume, isMuted]);

    // =========================================================
    // CARREGAR MÚSICAS
    // =========================================================

    const getSongsData = useCallback(async () => {
        try {
            const response = await axios.get(
                `${url}/api/song/list`
            );

            const songs =
                response.data?.songs || [];

            setOriginalSongsData(songs);
            setSongsData(songs);

            /*
             * Define a primeira música.
             */
            if (songs.length > 0) {
                setTrack(songs[0]);
            }
        } catch (error) {
            console.error(
                "Erro ao carregar músicas:",
                error
            );
        }
    }, [url]);

    // =========================================================
    // CARREGAR ÁLBUNS
    // =========================================================

    const getAlbumsData = useCallback(async () => {
        try {
            const response = await axios.get(
                `${url}/api/album/list`
            );

            setAlbumsData(
                response.data?.albums || []
            );
        } catch (error) {
            console.error(
                "Erro ao carregar álbuns:",
                error
            );
        }
    }, [url]);

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        getSongsData();
        getAlbumsData();
    }, [
        getSongsData,
        getAlbumsData,
    ]);

    // =========================================================
    // CONTEXT VALUE
    // =========================================================

    const contextValue = {
        // Audio
        audioRef,
        seekBar,
        seekBg,

        // Música atual
        track,
        setTrack,

        // Estado
        playStatus,
        setPlayStatus,

        // Tempo
        time,
        setTime,

        // Reprodução
        play,
        pause,
        togglePlay,
        playWithId,

        // Navegação
        nextSong,
        previousSong,

        // Compatibilidade com código antigo
        previusSong: previousSong,

        // Seek
        seekSong,

        // Dados
        songsData,
        albumsData,

        // Loop
        isLooping,
        toggleLoop,

        // Shuffle
        isShuffle,
        toggleShuffle,

        // Volume
        volume,
        handleVolumeChange,

        // Mute
        isMuted,
        toggleMute,

        // Pesquisa
        searchQuery,
        setSearchQuery,
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <PlayerContext.Provider
            value={contextValue}
        >
            {children}
        </PlayerContext.Provider>
    );
};

export default PlayerContextProvider;