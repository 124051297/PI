<?php
$sql = file_get_contents('C:\Users\chema\OneDrive\Documentos\GitHub\PI\ControlStock\nueva_base_datos.sql');
DB::unprepared($sql);
echo "Imported database successfully.\n";
