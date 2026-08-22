from __future__ import annotations

from app.nodes.io_nodes import (
    execute_raster_export,
    execute_raster_input,
    execute_table_export,
    execute_table_input,
    execute_vector_export,
    execute_vector_input,
)

REAL_EXECUTORS = {
    "raster-input": execute_raster_input,
    "vector-input": execute_vector_input,
    "table-input": execute_table_input,
    "raster-export": execute_raster_export,
    "vector-export": execute_vector_export,
    "table-export": execute_table_export,
}
