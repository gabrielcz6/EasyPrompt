import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    await prisma.fragment.deleteMany()

    await prisma.fragment.create({
        data: {
            label: 'Persona Senior',
            content: 'Actúa como un estratega de marketing senior con 15 años de experiencia...',
            category: 'Rol'
        }
    })

    await prisma.fragment.create({
        data: {
            label: 'Restricciones de formato',
            content: 'El output debe tener menos de 150 palabras. Solo dame el script, sin saludos y con formato Markdown.',
            category: 'Restricciones'
        }
    })

    await prisma.fragment.create({
        data: {
            label: 'Hook TikTok',
            content: '¡Cuidado! Si estás haciendo {{actividad}}, estás perdiendo dinero. Haz esto...',
            category: 'Hook'
        }
    })

    console.log('Seeded database with basic fragments.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
