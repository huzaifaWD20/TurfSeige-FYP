import pyodbc

server = 'DESKTOP-3FUC3U8\\SQLEXPRESS03'  # or 'Your-PC-Name\\SQLEXPRESS' if you're using a named instance
database = 'TurfSeige'
driver = 'ODBC Driver 17 for SQL Server'

connection_string = f'''
    DRIVER={{{driver}}};
    SERVER={server};
    DATABASE={database};
    Trusted_Connection=yes;
'''

try:
    conn = pyodbc.connect(connection_string)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sys.tables")
    tables = cursor.fetchall()

    print("✅ Connected to SQL Server database successfully!")
    print("📦 Available tables in 'FYP':")
    for table in tables:
        print("-", table.name)

    conn.close()
except Exception as e:
    print("❌ Connection failed:")
    print(e)
