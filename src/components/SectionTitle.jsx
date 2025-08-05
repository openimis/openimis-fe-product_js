import React from "react";
import clsx from "clsx";
import { styled } from "@mui/material/styles";
import { Box, Typography, Divider } from "@mui/material";

const StyledWrapper = styled('div')(({ theme }) => ({
  ...theme.paper.item,
  paddingBottom: 0,
}));

const StyledTitle = styled('div')(({ theme }) => ({
  ...theme.typography.title,
}));

const SectionTitle = (props) => {
  const { className, label } = props;
  return (
    <Box component={StyledWrapper} className={className}>
      <Typography component={StyledTitle}>{label}</Typography>
      <Divider variant="fullWidth" />
    </Box>
  );
};

export default SectionTitle;
