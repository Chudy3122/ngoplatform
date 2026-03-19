import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Admin, Prisma } from "@prisma/client";
import Image from "next/image";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

const AdminListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const session = await getSession();
  if (!session) redirect(`/pl/login`);
  if (session.role !== "ADMIN") redirect(`/pl/dashboard`);

  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "Username",
      accessor: "username",
      className: "hidden md:table-cell",
    },
    {
      header: "Email",
      accessor: "email",
      className: "hidden md:table-cell",
    },
    {
      header: "Actions",
      accessor: "action",
    },
  ];

  const renderRow = (item: Admin) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name || item.username}</h3>
          <p className="text-xs text-gray-500">{item.email || "-"}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.username}</td>
      <td className="hidden md:table-cell">{item.email || "-"}</td>
      <td>
        <div className="flex items-center gap-2">
          <FormContainer table="admin" type="update" data={item} />
          <FormContainer table="admin" type="delete" id={item.id} />
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  const query: Prisma.AdminWhereInput = {};

  if (queryParams?.search) {
    query.OR = [
      { name: { contains: queryParams.search, mode: "insensitive" } },
      { username: { contains: queryParams.search, mode: "insensitive" } },
      { email: { contains: queryParams.search, mode: "insensitive" } },
    ];
  }

  const [data, count] = await prisma.$transaction([
    prisma.admin.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.admin.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Admins</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <FormContainer table="admin" type="create" />
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default AdminListPage;
