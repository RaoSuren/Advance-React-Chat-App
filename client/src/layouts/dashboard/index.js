import React from "react";
import { Outlet } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { Box, Stack } from "@mui/material";
import Logo from "../../assets/Images/logo.ico";

const DashboardLayout = () => {
  const theme = useTheme();
  return (
    <>
      <Box>
        <Stack>
          <Box
            sx={{
              backgroundColor: theme.palette.primary.main,
              height: 64,
              width: 64,
              borderRadius: 1.5,
            }}
          >
            <img src={Logo} alt="" />
          </Box>
        </Stack>
      </Box>
      Dashboard Layout
      <Outlet />
    </>
  );
};

export default DashboardLayout;
