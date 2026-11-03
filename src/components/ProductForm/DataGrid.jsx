import React, { useMemo } from "react";

import { IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { GetIconComponent } from "@openimis/fe-core";

const EditIcon = GetIconComponent("Edit")

const DeleteIcon = GetIconComponent("DeleteOutlined")
const SaveIcon = GetIconComponent("Save")
const CancelIcon = GetIconComponent("Close")
import { DataGrid as MuiDataGrid, useGridApiContext } from "@mui/x-data-grid";

import { ErrorBoundary, useTranslations, useModulesManager } from "@openimis/fe-core";

const StyledActionsRoot = styled('div')(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

const CellActions = (props) => {
  const { id, onRowDelete } = props;
  const apiRef = useGridApiContext();
  const isInEditMode = apiRef.current.getRowMode(id) === "edit";

  const handleEditClick = (event) => {
    event.stopPropagation();
    apiRef.current.startRowEditMode({ id });
  };
  const handleSaveClick = (event) => {
    event.stopPropagation();
    apiRef.current.stopRowEditMode({ id });
  };
  const handleDeleteClick = (event) => {
    event.stopPropagation();
    onRowDelete(id, event);
  };
  const handleCancelClick = (event) => {
    event.stopPropagation();
    apiRef.current.stopRowEditMode({ id, ignoreModifications: true });

    const row = apiRef.current.getRow(id);
    if (row.isNew) {
      apiRef.current.updateRows([{ id, _action: "delete" }]);
      onRowDelete(id, event);
    }
  };

  if (isInEditMode) {
    return (
      <StyledActionsRoot>
        <IconButton color="primary" size="small" aria-label="save" onClick={handleSaveClick}>
          <SaveIcon fontSize="small" />
        </IconButton>
        <IconButton
          color="inherit"
          size="small"
          aria-label="cancel"
          onClick={handleCancelClick}
        >
          <CancelIcon fontSize="small" />
        </IconButton>
      </StyledActionsRoot>
    );
  }

  return (
    <StyledActionsRoot>
      <IconButton
        color="inherit"
        size="small"
        aria-label="edit"
        onClick={handleEditClick}
      >
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton color="inherit" size="small" aria-label="delete" onClick={handleDeleteClick}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </StyledActionsRoot>
  );
};

const DataGrid = (props) => {
  const {
    className,
    onChange,
    error,
    isLoading,
    density,
    readOnly,
    rows = [],
    processRow,
  } = props;
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("product.DataGrid", modulesManager);

  const preventRowEdit = (_, event) => (event.defaultMuiPrevented = true);
  // MUI X v6+ hands the saved row here; the v4 editRowsModel / onRowEditCommit props are ignored.
  const processRowUpdate = (newRow, oldRow) => {
    const row = processRow ? processRow(newRow, oldRow) : newRow;
    onChange(rows.map((x) => (x.id === row.id ? row : x)));
    return row;
  };

  const onRowDelete = (id) => {
    onChange(rows.filter((x) => x.id !== id));
  };

  const renderCellActions = (props) => <CellActions {...props} onRowDelete={onRowDelete} />;

  const columns = useMemo(() => {
    const baseColumns = props.columns;
    if (readOnly) return baseColumns;
    return [
      {
        field: "actions",
        headerName: formatMessage("actions"),
        renderCell: renderCellActions,
        sortable: false,
        disableColumnMenu: true,
        width: 100,
      },
      ...baseColumns,
    ];
  }, [props.columns, readOnly, rows]);

  return (
    <ErrorBoundary>
      <MuiDataGrid
        error={error}
        onRowEditStart={preventRowEdit}
        onRowEditStop={preventRowEdit}
        processRowUpdate={processRowUpdate}
        loading={isLoading}
        columns={columns}
        density={density}
        editMode="row"
        className={className}
        rows={rows}
      />
    </ErrorBoundary>
  );
};
export default DataGrid;
