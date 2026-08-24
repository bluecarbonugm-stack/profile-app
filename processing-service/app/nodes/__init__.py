from __future__ import annotations

from app.nodes.classify_rf import execute_classify_rf
from app.nodes.hedley import execute_hedley
from app.nodes.io_nodes import (
    execute_raster_export,
    execute_raster_input,
    execute_table_export,
    execute_table_input,
    execute_vector_export,
    execute_vector_input,
)
from app.nodes.lyzenga import execute_lyzenga

REAL_EXECUTORS = {
    "raster-input": execute_raster_input,
    "vector-input": execute_vector_input,
    "table-input": execute_table_input,
    "raster-export": execute_raster_export,
    "vector-export": execute_vector_export,
    "table-export": execute_table_export,
    "sunglint": execute_hedley,
    "water-column": execute_lyzenga,
    "rf-train": execute_classify_rf,
}
