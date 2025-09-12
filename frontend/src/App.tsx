import { AppBar, Box, Button, Container, Toolbar, Typography, CssBaseline, useTheme } from "@mui/material";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import { Footer } from "./components/Footer";
import { NekroEdgeLogo } from "./assets/logos";
import { ToggleThemeButton } from "./components/ToggleThemeButton";

function App() {
  const location = useLocation();
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline />
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          color: theme.palette.text.primary,
          backgroundColor: theme.appBar.background,
          backdropFilter: "blur(12px) saturate(180%)",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                mr: 2,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <NekroEdgeLogo height={32} />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  ml: 1.5,
                  display: { xs: "none", md: "flex" },
                  fontFamily: "monospace",
                  fontWeight: 700,
                }}
              >
                NekroEdge
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Button
              component={RouterLink}
              to="/features"
              sx={{
                my: 2,
                color: "inherit",
                display: "block",
                fontWeight: location.pathname === "/features" ? "bold" : "normal",
              }}
            >
              API 示例
            </Button>

            <ToggleThemeButton />
          </Toolbar>
        </Container>
      </AppBar>
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}

export default App;
