import { getFeeStructures } from './actions'
import { AddFeeStructureDrawer } from '@/components/fees/AddFeeStructureDrawer'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, MoreHorizontal, Receipt } from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const dynamic = 'force-dynamic'

export default async function FeeStructuresPage() {
  const { data: structures, error } = await getFeeStructures()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/dashboard/fees">
          <Button variant="outline" size="icon" className="w-8 h-8 rounded-full">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Link href="/dashboard/fees" className="hover:text-primary transition-colors">Fees Ledger</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Structures</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fee Structures</h2>
          <p className="text-muted-foreground">
            Define templates for tuition, registration, and other recurring fees.
          </p>
        </div>
        <AddFeeStructureDrawer />
      </div>

      {error ? (
        <div className="p-8 text-center bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
          <p>Failed to load fee structures: {error}</p>
        </div>
      ) : structures && structures.length > 0 ? (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {structures.map((structure: any) => (
                <TableRow key={structure.id} className="group hover:bg-muted/30">
                  <TableCell>
                    <div>
                      <p className="font-medium leading-none">{structure.name}</p>
                      {structure.description && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{structure.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-primary">₹{Number(structure.amount).toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{structure.frequency}</Badge>
                  </TableCell>
                  <TableCell>
                    {structure.is_active ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-muted-foreground">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          render={
                            <div className="flex items-center gap-2 cursor-pointer w-full">
                              Edit Structure
                            </div>
                          }
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-card rounded-xl border border-border/50 border-dashed">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
            <Receipt className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium mb-2">No fee structures found</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Create a fee structure to easily apply standard pricing to your students.
          </p>
          <AddFeeStructureDrawer />
        </div>
      )}
    </div>
  )
}
