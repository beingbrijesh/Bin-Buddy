<?php
$csvUrl = "https://docs.google.com/spreadsheets/d/1RxtOwwD5Y4pi5y1LuDMiTXyB4b-z4iu5Nq0v-0t6Qck/export?format=csv&gid=825803499";

$rows = [];

if (($handle = fopen($csvUrl, "r")) !== FALSE) {
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        $rows[] = $data;
    }
    fclose($handle);
} else {
    die("Unable to load data from Google Sheets.");
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Bin-Buddy Dashboard</title>
    <link rel="stylesheet" href="css/style.css"> <!-- Optional: use your existing CSS -->
    <style>
        table {
            border-collapse: collapse;
            width: 100%;
            margin-top: 20px;
        }
        table, th, td {
            border: 1px solid #aaa;
            padding: 10px;
        }
        th {
            background-color: #e0e0e0;
        }
    </style>
    <meta http-equiv="refresh" content="15"> <!-- Auto-refresh every 15 seconds -->
</head>
<body>
    <h2 style="text-align:center;">Live Google Sheet Data</h2>
    <table>
        <?php foreach ($rows as $i => $row): ?>
            <tr>
                <?php foreach ($row as $cell): ?>
                    <?php if ($i === 0): ?>
                        <th><?= htmlspecialchars($cell) ?></th>
                    <?php else: ?>
                        <td><?= htmlspecialchars($cell) ?></td>
                    <?php endif; ?>
                <?php endforeach; ?>
            </tr>
        <?php endforeach; ?>
    </table>
</body>
</html>
