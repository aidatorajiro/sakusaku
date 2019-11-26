import zlib
with open("dictionary_oss/connection.deflate", "rb") as f:
    data = f.read()
    decomp = zlib.decompress(data)
	with open("dictionary_oss/connection.txt", "w") as g:
		g.write(decomp.decode())
