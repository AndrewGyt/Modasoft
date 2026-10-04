import { PrismaClient } from "@prisma/client"

const db = new PrismaClient()
const TENANT_ID = "tendance-001"
const USUARIO_ID = "usuario-demo"

function categoriaDesdeNombre(nombre: string): string {
  const n = nombre.toUpperCase()
  if (n.includes("FALDA") || n.includes("SAIA")) return "FALDAS"
  if (n.includes("PANTALON") || n.includes("CALCA") || n.includes("BERMUDA")) return "PANTALONES"
  if (n.includes("BLUSA") || n.includes("SOLERA")) return "BLUSAS"
  if (n.includes("VESTIDO")) return "VESTIDOS"
  if (n.includes("CHAQUETA") || n.includes("SACO") || n.includes("BLAZER")) return "CHAQUETAS"
  if (n.includes("CAMISA")) return "CAMISAS"
  if (n.includes("TOP") || n.includes("POLERA") || n.includes("COLETE")) return "TOPS"
  return "OTROS"
}

const agosto = [
  { nombre: "FALDA LARGA CAFÉ DETALLE D ENCAJE", sku: "IA-72437", precioOrigen: 98.91, tc: 2.2, precioVenta: 460, cant: 2, vendido: 1, stock: 1, credito: 427.8, clienteCredito: "ALE GIL" },
  { nombre: "PANTALON MARI CUENTA VERO", sku: "IA-61267", precioOrigen: 116.91, tc: 2.2, precioVenta: 0, cant: 1, vendido: 0, stock: 0, credito: 0, clienteCredito: null },
  { nombre: "BLUSA VERDE MANGA CORTA GASA DETALLE ENCAJE", sku: "IA-68769", precioOrigen: 58.41, tc: 2.2, precioVenta: 390, cant: 2, vendido: 2, stock: 0, credito: 0, clienteCredito: null },
  { nombre: "PANTALON PINZAS NEGRO", sku: "IA-61867", precioOrigen: 116.1, tc: 2.2, precioVenta: 620, cant: 2, vendido: 2, stock: 0, credito: 0, clienteCredito: null },
  { nombre: "SACO LINO BOTON DORADO ROJO NEGRO", sku: "IA-61697", precioOrigen: 80.1, tc: 2.2, precioVenta: 390, cant: 2, vendido: 1, stock: 1, credito: 362.7, clienteCredito: "RAQUEL CHAVEZ" },
  { nombre: "BLUSA TIROS ENCAJE LEOPARD", sku: "IA-74398", precioOrigen: 44.91, tc: 2.2, precioVenta: 390, cant: 3, vendido: 3, stock: 0, credito: 0, clienteCredito: null },
  { nombre: "BLUSA CERO ESCOTE V DETALLE DE ENCAJE UVA NEGRO", sku: "IA-81629", precioOrigen: 44.91, tc: 2.2, precioVenta: 290, cant: 5, vendido: 1, stock: 4, credito: 0, clienteCredito: null },
  { nombre: "PANTALON ANIMAL PRINT TOSTADO NEGRO", sku: "IA-76998", precioOrigen: 98.91, tc: 2.2, precioVenta: 520, cant: 3, vendido: 3, stock: 0, credito: 483.6, clienteCredito: "ALE GIL" },
  { nombre: "VESTIDO ANIMAL PRINT TOSTADO NEGRO", sku: "IA-76939", precioOrigen: 98.91, tc: 2.2, precioVenta: 550, cant: 1, vendido: 1, stock: 0, credito: 211.5, clienteCredito: "KARINA MOLINA" },
  { nombre: "BLUSA CERO LEOPARDO GASA", sku: "IA-80798", precioOrigen: 35.91, tc: 2.2, precioVenta: 270, cant: 3, vendido: 2, stock: 1, credito: 0, clienteCredito: null },
  { nombre: "POLERA CROP A RAYAS TEJIDA B/CAFÉ", sku: "IA-80699", precioOrigen: 49.41, tc: 2.2, precioVenta: 310, cant: 2, vendido: 1, stock: 1, credito: 0, clienteCredito: null },
  { nombre: "CHAQUETA VERDE Y UVA ELASTICO N CINTURA", sku: "IA-81695", precioOrigen: 85.41, tc: 2.2, precioVenta: 460, cant: 2, vendido: 2, stock: 0, credito: 427.8, clienteCredito: "DANI RIVERO" },
  { nombre: "BLUSA BLANCA MANGA LARGA LINEA NEGRA", sku: "IA-83299", precioOrigen: 53.91, tc: 2.2, precioVenta: 420, cant: 3, vendido: 3, stock: 0, credito: 90.6, clienteCredito: "CLAU FERRUFINO" },
  { nombre: "BLUSA TRANSPARENTE MANGA LARGA C/TOP", sku: "IA-60568", precioOrigen: 69.21, tc: 2.2, precioVenta: 390, cant: 1, vendido: 1, stock: 0, credito: 0, clienteCredito: null },
  { nombre: "CAMISA SUEDE MANGA LARGA AZUL", sku: "IA-79637", precioOrigen: 89.91, tc: 2.2, precioVenta: 450, cant: 2, vendido: 1, stock: 1, credito: 0, clienteCredito: null },
  { nombre: "CHAQUETA CUELLO ALTO BOTONES NEGRO/VERDE", sku: "IA-84197", precioOrigen: 103.41, tc: 2.2, precioVenta: 520, cant: 4, vendido: 3, stock: 1, credito: 0, clienteCredito: null },
  { nombre: "CHAQUETA CREMA TOSTADO CORDEROI", sku: "IA-82899", precioOrigen: 67.41, tc: 2.2, precioVenta: 450, cant: 3, vendido: 3, stock: 0, credito: 146.3, clienteCredito: "GABI LOPEZ" },
  { nombre: "VESTIDO MOTAS CAFÉ/NEGRO ENCAJE", sku: "IA-80995", precioOrigen: 89.91, tc: 2.2, precioVenta: 530, cant: 2, vendido: 2, stock: 0, credito: 0, clienteCredito: null },
  { nombre: "CAMISA ANIMAL PRINT 2 TONOS M/L", sku: "IA-78097", precioOrigen: 80.91, tc: 2.2, precioVenta: 450, cant: 4, vendido: 2, stock: 2, credito: 152.0, clienteCredito: "MARIA RENE G" },
  { nombre: "BLUSA CERO ANIMAL PRINT BEIBE Y TOSTADO", sku: "IA-78096", precioOrigen: 40.41, tc: 2.2, precioVenta: 310, cant: 3, vendido: 2, stock: 1, credito: 0, clienteCredito: null },
  { nombre: "TOP DE ENCAJE TIROS NEGRO", sku: "IA-82694", precioOrigen: 31.41, tc: 2.2, precioVenta: 220, cant: 3, vendido: 3, stock: 0, credito: 204.6, clienteCredito: "ALE GIL" },
]

const septiembre = [
  { nombre: "BERMUDA MIDI LIMA ROSA", sku: "IAS-6207700", precioOrigen: 110, tc: 2.29, precioVenta: 490, cant: 2, vendido: 1, stock: 1, credito: 4.4, clienteCredito: "FABI LOBO" },
  { nombre: "BLAZER OVER BLANCO Y BEIGE A RAYAS SET", sku: "IAS-5183208", precioOrigen: 235, tc: 2.29, precioVenta: 980, cant: 2, vendido: 1, stock: 1, credito: 911.4, clienteCredito: "MIROS" },
  { nombre: "BLAZER MANGA CORTA ROSA Y CAFÉ", sku: "IAS-6102500", precioOrigen: 136, tc: 2.29, precioVenta: 650, cant: 3, vendido: 0, stock: 3, credito: 0, clienteCredito: null },
  { nombre: "BLUSA DECOTE ELASTIZADA NEGRA Y CAFÉ", sku: "IAS-6116900", precioOrigen: 90, tc: 2.29, precioVenta: 450, cant: 2, vendido: 1, stock: 1, credito: 418.5, clienteCredito: "SANDRA" },
  { nombre: "BLUSA S/M LE NEGRA Y MOTAS PEQUEÑAS NEGRA TRANSPARENCIA", sku: "IAS-6116500", precioOrigen: 104, tc: 2.29, precioVenta: 480, cant: 3, vendido: 0, stock: 3, credito: 0, clienteCredito: null },
  { nombre: "BLUSA EM POA NEGRA MOTAS GRANDES", sku: "IAS-5184400", precioOrigen: 97, tc: 2.29, precioVenta: 480, cant: 2, vendido: 1, stock: 1, credito: 446.4, clienteCredito: "SANDRA" },
  { nombre: "CALCA ALFAIA PANTALON BLANCO BEIGE RAYAS SET", sku: "IAS-6208400", precioOrigen: 149, tc: 2.29, precioVenta: 790, cant: 4, vendido: 1, stock: 3, credito: 734.7, clienteCredito: "FABI LOBO" },
  { nombre: "CALCA BALLON JOGGER AMARILLO BLANCO CAFÉ", sku: "IAS-6208600", precioOrigen: 140, tc: 2.29, precioVenta: 750, cant: 3, vendido: 1, stock: 2, credito: 697.5, clienteCredito: "MIROS" },
  { nombre: "CALCA BALLON TEXTURADO BEIGE", sku: "IAS-6208800", precioOrigen: 140, tc: 2.29, precioVenta: 650, cant: 1, vendido: 1, stock: 0, credito: 604.5, clienteCredito: "MIROS" },
  { nombre: "CALCA CENOUR PANTALON PISTACHO SET", sku: "IAS-6201700", precioOrigen: 145, tc: 2.29, precioVenta: 690, cant: 3, vendido: 0, stock: 3, credito: 0, clienteCredito: null },
  { nombre: "CALCA CENOUR PANTALON GRUESO CAFÉ", sku: "IAS-6205400", precioOrigen: 117, tc: 2.29, precioVenta: 690, cant: 2, vendido: 0, stock: 2, credito: 0, clienteCredito: null },
  { nombre: "CALCA RETA C PANTALON PALO DE ROSA CAKI Y ROJO", sku: "IAS-6207100", precioOrigen: 151, tc: 2.29, precioVenta: 750, cant: 5, vendido: 1, stock: 4, credito: 0, clienteCredito: null },
  { nombre: "CAMISA EM TR AMARILLA BLANCA CAFÉ SET", sku: "IAS-6117800", precioOrigen: 133, tc: 2.29, precioVenta: 590, cant: 3, vendido: 1, stock: 2, credito: 548.7, clienteCredito: "MIROS" },
  { nombre: "CAMISA S/MANGA CERO LINO Y BORDADO CELESTE BEIGE ROSA", sku: "IAS-6117500", precioOrigen: 145, tc: 2.29, precioVenta: 590, cant: 3, vendido: 0, stock: 3, credito: 0, clienteCredito: null },
  { nombre: "BLUSA CHALECO PISTACHO SET", sku: "IAS-6103400", precioOrigen: 135, tc: 2.29, precioVenta: 570, cant: 3, vendido: 0, stock: 3, credito: 0, clienteCredito: null },
  { nombre: "COLETE BLUSA CHALECO BEIGE Y BLANCO RAYAS SET", sku: "IAS-6117200", precioOrigen: 119, tc: 2.29, precioVenta: 590, cant: 3, vendido: 2, stock: 1, credito: 548.7, clienteCredito: "ALE GIL" },
  { nombre: "COLETE PEPLUM AMARILLO Y ROSA SET", sku: "IAS-6114800", precioOrigen: 100, tc: 2.29, precioVenta: 530, cant: 2, vendido: 1, stock: 1, credito: 492.9, clienteCredito: "FABI LOBO" },
  { nombre: "BLUSA SOLERA PUNTOS ENCAJE SET NEGRO Y VAINILLA", sku: "IAS-6119100", precioOrigen: 84, tc: 2.29, precioVenta: 390, cant: 4, vendido: 0, stock: 4, credito: 0, clienteCredito: null },
  { nombre: "BLUSA SOLERA SEDA ROSA NUDE CAFÉ", sku: "IAS-6118200", precioOrigen: 83, tc: 2.29, precioVenta: 390, cant: 4, vendido: 0, stock: 4, credito: 0, clienteCredito: null },
  { nombre: "BLUSA SOLERA ENCAJE VINO AGUA ROSA", sku: "IAS-6114000", precioOrigen: 86, tc: 2.29, precioVenta: 390, cant: 5, vendido: 0, stock: 5, credito: 0, clienteCredito: null },
  { nombre: "SAIA MIDI FALDA PUNTOS NEGRA Y VAINILLA ENCAJE SET", sku: "IAS-6303600", precioOrigen: 131, tc: 2.29, precioVenta: 590, cant: 3, vendido: 0, stock: 3, credito: 0, clienteCredito: null },
  { nombre: "SAIA MINI FALDA TABLEADA CON CINTURON", sku: "IAS-6302600", precioOrigen: 127, tc: 2.29, precioVenta: 590, cant: 3, vendido: 2, stock: 1, credito: 548.7, clienteCredito: "SUSAN" },
  { nombre: "VESTIDO ESTAMPA FLORES GLOBO M/LARGA", sku: "IAS-5438500", precioOrigen: 189, tc: 2.29, precioVenta: 850, cant: 1, vendido: 0, stock: 1, credito: 0, clienteCredito: null },
]

async function main() {
  console.log("🌱 Iniciando seed de Tendance con datos reales...")

  let tenant = await db.tenant.findUnique({ where: { id: TENANT_ID } })
  if (!tenant) {
    tenant = await db.tenant.create({
      data: { id: TENANT_ID, nombre: "Tendance" },
    })
  }

  let usuario = await db.usuario.findUnique({ where: { id: USUARIO_ID } })
  if (!usuario) {
    usuario = await db.usuario.create({
      data: {
        id: USUARIO_ID,
        tenantId: TENANT_ID,
        nombre: "Andre",
        email: "andre_rf97@hotmail.com",
        rol: "ADMIN",
      },
    })
  }

  const proveedorCheers = await db.proveedor.upsert({
    where: { id: "proveedor-cheers" },
    update: {},
    create: { id: "proveedor-cheers", tenantId: TENANT_ID, nombre: "CHEERS Brasil", pais: "Brasil", leadTimeDias: 7 },
  })

  const proveedorPury = await db.proveedor.upsert({
    where: { id: "proveedor-pury" },
    update: {},
    create: { id: "proveedor-pury", tenantId: TENANT_ID, nombre: "PURY Brasil", pais: "Brasil", leadTimeDias: 7 },
  })

  const categoriaCache: Record<string, any> = {}

  async function getCategoria(nombre: string) {
    if (categoriaCache[nombre]) return categoriaCache[nombre]
    let cat = await db.categoria.findFirst({ where: { tenantId: TENANT_ID, nombre } })
    if (!cat) cat = await db.categoria.create({ data: { tenantId: TENANT_ID, nombre } })
    categoriaCache[nombre] = cat
    return cat
  }

  const clienteCache: Record<string, any> = {}

  async function getCliente(nombre: string) {
    if (clienteCache[nombre]) return clienteCache[nombre]
    let cliente = await db.cliente.findFirst({ where: { tenantId: TENANT_ID, nombre } })
    if (!cliente) cliente = await db.cliente.create({ data: { tenantId: TENANT_ID, nombre } })
    clienteCache[nombre] = cliente
    return cliente
  }

  async function cargarLote(productos: typeof agosto, proveedor: any, marca: string, temporada: string, fechaBase: Date) {
    for (const p of productos) {
      const catNombre = categoriaDesdeNombre(p.nombre)
      const categoria = await getCategoria(catNombre)
      const precioCompra = p.precioOrigen * p.tc
      const precioVenta = p.precioVenta > 0 ? p.precioVenta : precioCompra * 2

      const existe = await db.producto.findUnique({ where: { sku: p.sku } })
      if (existe) { console.log(`⚠ Ya existe: ${p.nombre}`); continue }

      const producto = await db.producto.create({
        data: {
          tenantId: TENANT_ID,
          categoriaId: categoria.id,
          proveedorId: proveedor.id,
          nombre: p.nombre,
          sku: p.sku,
          marca,
          precioCompra,
          precioVenta,
          monedaOrigen: "BRL",
          precioOrigen: p.precioOrigen,
          tipoCambio: p.tc,
          margenGanancia: 100,
          temporada,
          variantes: {
            create: {
              talla: "Única",
              color: "SEGÚN DESCRIPCIÓN",
              stockActual: p.stock,
              stockMinimo: 1,
            },
          },
        },
      })

      const variante = await db.variante.findFirst({ where: { productoId: producto.id } })
      if (!variante) continue

      if (p.vendido > 0) {
        const venta = await db.venta.create({
          data: {
            tenantId: TENANT_ID,
            usuarioId: USUARIO_ID,
            total: precioVenta * p.vendido,
            descuento: 0,
            metodoPago: p.credito > 0 ? "credito" : "efectivo",
            createdAt: fechaBase,
            detalles: {
              create: {
                varianteId: variante.id,
                cantidad: p.vendido,
                precioUnitario: precioVenta,
              },
            },
          },
        })

        if (p.credito > 0 && p.clienteCredito) {
          const cliente = await getCliente(p.clienteCredito)
          const fechaVenc = new Date(fechaBase)
          fechaVenc.setDate(fechaVenc.getDate() + 30)

          await db.credito.create({
            data: {
              tenantId: TENANT_ID,
              clienteId: cliente.id,
              ventaId: venta.id,
              montoTotal: precioVenta * p.vendido,
              montoPagado: (precioVenta * p.vendido) - p.credito,
              fechaVencimiento: fechaVenc,
              estado: p.credito >= precioVenta * p.vendido ? "PENDIENTE" : "PARCIAL",
              pagos: (precioVenta * p.vendido) - p.credito > 0 ? {
                create: {
                  monto: (precioVenta * p.vendido) - p.credito,
                  metodoPago: "efectivo",
                  notas: "Abono inicial",
                },
              } : undefined,
            },
          })
        }
      }

      console.log(`✓ ${p.nombre} — stock: ${p.stock}, vendido: ${p.vendido}${p.credito > 0 ? ` | crédito: ${p.clienteCredito}` : ""}`)
    }
  }

  console.log("\n📦 Cargando inventario AGOSTO (CHEERS)...")
  await cargarLote(agosto, proveedorCheers, "CHEERS", "invierno", new Date("2026-08-01"))

  console.log("\n📦 Cargando inventario SEPTIEMBRE (PURY)...")
  await cargarLote(septiembre, proveedorPury, "PURY", "primavera", new Date("2026-09-01"))

  console.log("\n✅ Seed completado — datos reales de Tendance cargados!")
  console.log(`   • ${agosto.length} productos de Agosto (CHEERS)`)
  console.log(`   • ${septiembre.length} productos de Septiembre (PURY)`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())