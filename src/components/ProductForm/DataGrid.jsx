import React, { useState, useMemo, useRef, useEffect } from "react";
import _ from "lodash";

import { IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
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
    bindLimitTypesWithDefaultValues,
  } = props;
  const [editRowsModel, setEditRowsModel] = useState({});
  const [rowId, setRowId] = useState(null);
  const modulesManager = useModulesManager();
  const { formatMessage } = useTranslations("product.DataGrid", modulesManager);
  const prevItemsOrServicesRef = useRef();

  const preventRowEdit = (_, event) => (event.defaultMuiPrevented = true);
  const onRowEditCommit = (id, event) => {
    const idx = _.findIndex(rows, { id });
    const newRow = { ...rows[idx] };
    if (Object.keys(editRowsModel).length !== 0) {
      for (const [key, field] of Object.entries(editRowsModel[id])) {
        newRow[key] = field.value;
      }
    }

    const newRows = [...rows];
    newRows.splice(idx, 1, newRow);
    onChange(newRows);
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

  const getLastedEditedRowId = (prevRows, currentRows) => {
    for (const key of Object.keys(currentRows)) {
      if (prevRows && prevRows.hasOwnProperty(key)) {
        if (!_.isEqual(prevRows[key], currentRows[key])) {
          return key;
        }
      }
    }
    return Object.keys(currentRows)[0];
  }

  useEffect(() => {
    if (rowId) {
      onRowEditCommit(rowId)
    }
  }, [editRowsModel])

  const handleEditRowsModel = (itemsOrServices) => {
    setRowId(getLastedEditedRowId(prevItemsOrServicesRef.current, itemsOrServices));
    bindLimitTypesWithDefaultValues(itemsOrServices, prevItemsOrServicesRef.current);
    setEditRowsModel(itemsOrServices);
    prevItemsOrServicesRef.current = itemsOrServices;
  }

  return (
    <ErrorBoundary>
      <MuiDataGrid
        error={error}
        onRowEditStart={preventRowEdit}
        onRowEditStop={preventRowEdit}
        onRowEditCommit={onRowEditCommit}
        loading={isLoading}
        columns={columns}
        density={density}
        editMode="row"
        editRowsModel={editRowsModel}
        onEditRowsModelChange={handleEditRowsModel}
        className={className}
        rows={rows}
      />
    </ErrorBoundary>
  );
};
export default DataGrid;
