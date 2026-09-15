import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Box, IconButton, alpha, useTheme } from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

interface FilaDeslizableProps {
  children: ReactNode;
  gap?: number;
}

/**
 * Fila horizontal de chips que se puede recorrer también con mouse: flechas en
 * los bordes, rueda del mouse y barra fina. Antes la barra estaba oculta y sólo
 * se podía deslizar con el dedo, así que en escritorio quedaba inaccesible.
 */
const FilaDeslizable = ({ children, gap = 0.75 }: FilaDeslizableProps) => {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [puedeIzq, setPuedeIzq] = useState(false);
  const [puedeDer, setPuedeDer] = useState(false);

  const medir = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setPuedeIzq(el.scrollLeft > 1);
    setPuedeDer(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  /* El contenido cambia al cargar los favoritos: se vuelve a medir. */
  useEffect(() => {
    medir();
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(medir);
    observer.observe(el);

    /*
     * La rueda vertical desplaza en horizontal mientras haya hacia dónde ir;
     * en los extremos se deja pasar para que la página siga desplazándose.
     * Se registra a mano porque el onWheel de React es pasivo.
     */
    const onWheel = (event: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;

      const haciaDerecha = event.deltaY > 0;
      const alFinal = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      const alInicio = el.scrollLeft <= 0;
      if ((haciaDerecha && alFinal) || (!haciaDerecha && alInicio)) return;

      event.preventDefault();
      el.scrollLeft += event.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      observer.disconnect();
      el.removeEventListener("wheel", onWheel);
    };
  }, [medir]);

  const desplazar = (direccion: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: direccion * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const fondo = theme.palette.background.paper;

  const flecha = (direccion: 1 | -1) => (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        bottom: 6,
        [direccion === -1 ? "left" : "right"]: 0,
        display: { xs: "none", sm: "flex" },
        alignItems: "center",
        px: 0.25,
        zIndex: 1,
        pointerEvents: "none",
        background: `linear-gradient(${direccion === -1 ? "90deg" : "270deg"}, ${fondo} 55%, ${alpha(
          fondo,
          0
        )})`,
      }}
    >
      <IconButton
        size="small"
        onClick={() => desplazar(direccion)}
        aria-label={direccion === -1 ? "Ver anteriores" : "Ver siguientes"}
        sx={{ pointerEvents: "auto", border: `1px solid ${theme.palette.divider}`, backgroundColor: fondo }}
      >
        {direccion === -1 ? (
          <ChevronLeftRoundedIcon fontSize="small" />
        ) : (
          <ChevronRightRoundedIcon fontSize="small" />
        )}
      </IconButton>
    </Box>
  );

  return (
    <Box sx={{ position: "relative", minWidth: 0, width: "100%" }}>
      {puedeIzq && flecha(-1)}
      <Box
        ref={ref}
        onScroll={medir}
        sx={{
          display: "flex",
          gap,
          overflowX: "auto",
          pb: 0.75,
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.text.primary, 0.25),
          },
          "& > *": { flexShrink: 0 },
        }}
      >
        {children}
      </Box>
      {puedeDer && flecha(1)}
    </Box>
  );
};

export default FilaDeslizable;
